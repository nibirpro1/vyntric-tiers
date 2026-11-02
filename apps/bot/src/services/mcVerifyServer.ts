import net from "net";
import { Client, GuildMember } from "discord.js";
import { config } from "../config.js";
import { REGION_MAP, Region } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { memoryPlayers } from "./queueService.js";

// Helper for database checking
export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL || "";
  return url.startsWith("postgresql://") && !url.includes("[YOUR-");
}

export interface PendingVerification {
  code: string;
  discordId: string;
  createdAt: number;
  ign?: string;
  region?: Region;
  verified: boolean;
}

// In-memory verification sessions
export const pendingVerificationsByCode = new Map<string, PendingVerification>();
export const pendingVerificationsByDiscordId = new Map<string, PendingVerification>();
export const recentVerifiedAccounts = new Map<string, { ign: string; discordId: string; verifiedAt: number }>();

/**
 * Generates a clean 5-character alphanumeric auth code (e.g. "x7k9p", "vyn4k").
 */
export function generateAuthCode(discordId: string): string {
  // Clean expired sessions (> 15 minutes)
  const now = Date.now();
  for (const [code, sess] of pendingVerificationsByCode.entries()) {
    if (now - sess.createdAt > 15 * 60 * 1000) {
      pendingVerificationsByCode.delete(code);
      if (pendingVerificationsByDiscordId.get(sess.discordId)?.code === code) {
        pendingVerificationsByDiscordId.delete(sess.discordId);
      }
    }
  }

  // Check if active code already exists
  const existing = pendingVerificationsByDiscordId.get(discordId);
  if (existing && now - existing.createdAt < 15 * 60 * 1000) {
    return existing.code;
  }

  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // readable chars without ambiguous 0/O, 1/l
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const sess: PendingVerification = {
    code,
    discordId,
    createdAt: now,
    verified: false,
  };

  pendingVerificationsByCode.set(code.toLowerCase(), sess);
  pendingVerificationsByDiscordId.set(discordId, sess);

  return code;
}

// --- MINECRAFT PROTOCOL UTILITIES ---

function readVarInt(buffer: Buffer, offset: number): { value: number; bytes: number } {
  let value = 0;
  let bytes = 0;
  let currentByte: number;

  while (true) {
    if (offset + bytes >= buffer.length) {
      throw new Error("Buffer too short for VarInt");
    }
    currentByte = buffer[offset + bytes];
    value |= (currentByte & 0x7f) << (bytes * 7);
    bytes++;
    if ((currentByte & 0x80) === 0) break;
    if (bytes > 5) throw new Error("VarInt too large");
  }

  return { value, bytes };
}

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  while (true) {
    if ((value & ~0x7f) === 0) {
      bytes.push(value);
      break;
    } else {
      bytes.push((value & 0x7f) | 0x80);
      value >>>= 7;
    }
  }
  return Buffer.from(bytes);
}

function readString(buffer: Buffer, offset: number): { value: string; bytes: number } {
  const { value: length, bytes: lenBytes } = readVarInt(buffer, offset);
  const start = offset + lenBytes;
  const end = start + length;
  if (end > buffer.length) {
    throw new Error("Buffer too short for string");
  }
  const value = buffer.toString("utf8", start, end);
  return { value, bytes: lenBytes + length };
}

function writeString(str: string): Buffer {
  const strBuf = Buffer.from(str, "utf8");
  const lenBuf = writeVarInt(strBuf.length);
  return Buffer.concat([lenBuf, strBuf]);
}

function createPacket(packetId: number, data: Buffer): Buffer {
  const idBuf = writeVarInt(packetId);
  const lenBuf = writeVarInt(idBuf.length + data.length);
  return Buffer.concat([lenBuf, idBuf, data]);
}

/**
 * Creates the exact Minecraft kick screen shown in Screenshot 4:
 * Connection Lost
 * Account Verified (IGN)
 * Please click the "Enter Waitlist" button on the Discord to continue.
 */
function createDisconnectReason(ign: string): string {
  return JSON.stringify({
    text: `\n§aAccount Verified (${ign})\n\n§ePlease click the §b"Enter Waitlist"§e button on the Discord to continue.\n`,
  });
}

/**
 * Lightweight TCP server listening for Minecraft connections.
 */
export class McVerifyServer {
  private static server: net.Server | null = null;
  private static discordClient: Client | null = null;

  public static start(client: Client, port = (config as any).MC_VERIFY_PORT || 25565): void {
    if (this.server) return;
    this.discordClient = client;

    const server = net.createServer((socket) => {
      let state = 0; // 0 = Handshake, 1 = Status, 2 = Login
      let serverHost = "";
      let buffer = Buffer.alloc(0);

      socket.on("data", async (chunk) => {
        try {
          buffer = Buffer.concat([buffer, chunk]);

          while (buffer.length > 0) {
            let offset = 0;
            let packetLength = 0;
            let lenBytes = 0;

            try {
              const res = readVarInt(buffer, offset);
              packetLength = res.value;
              lenBytes = res.bytes;
            } catch {
              // Need more data
              break;
            }

            if (buffer.length < lenBytes + packetLength) {
              // Wait for full packet
              break;
            }

            offset += lenBytes;
            const packetData = buffer.subarray(offset, offset + packetLength);
            buffer = buffer.subarray(offset + packetLength);

            let dataOffset = 0;
            const { value: packetId, bytes: idBytes } = readVarInt(packetData, dataOffset);
            dataOffset += idBytes;

            // 1. Handshake State
            if (state === 0 && packetId === 0x00) {
              const proto = readVarInt(packetData, dataOffset);
              dataOffset += proto.bytes;

              const host = readString(packetData, dataOffset);
              serverHost = host.value;
              dataOffset += host.bytes;

              // Read port (unsigned short, 2 bytes)
              dataOffset += 2;

              const nextStateRes = readVarInt(packetData, dataOffset);
              state = nextStateRes.value; // 1 = Status, 2 = Login
              continue;
            }

            // 2. Status State (Server list ping)
            if (state === 1) {
              if (packetId === 0x00) {
                // Status Request -> send MOTD
                const statusJson = JSON.stringify({
                  version: { name: "Vyntric Verify 1.21+", protocol: 767 },
                  players: { max: 100, online: 0 },
                  description: {
                    text: "§5§lVyntric Tiers §8» §aDirect Connect to Verify Account",
                  },
                });
                const responsePacket = createPacket(0x00, writeString(statusJson));
                socket.write(responsePacket);
              } else if (packetId === 0x01) {
                // Ping packet -> echo pong
                const pongPacket = createPacket(0x01, packetData.subarray(dataOffset));
                socket.write(pongPacket);
                socket.end();
              }
              continue;
            }

            // 3. Login State (Direct Connect handshake)
            if (state === 2 && packetId === 0x00) {
              // Login Start packet
              const nameRes = readString(packetData, dataOffset);
              const ign = nameRes.value.trim();

              console.log(`[MC-Verify] Inbound verification connection: IGN "${ign}" on host "${serverHost}"`);

              // Extract auth code from hostname (e.g. "vy8k1.verify.vyntric.gg" -> "vy8k1")
              let matchedCode = "";
              const hostParts = serverHost.split(".")[0]?.toLowerCase() || "";
              if (pendingVerificationsByCode.has(hostParts)) {
                matchedCode = hostParts;
              } else {
                // If connecting to root domain (e.g. "localhost" or "verify.vyntric.gg"), find most recent pending session
                const sessions = Array.from(pendingVerificationsByCode.values()).filter((s) => !s.verified);
                if (sessions.length > 0) {
                  // Sort by most recent
                  sessions.sort((a, b) => b.createdAt - a.createdAt);
                  matchedCode = sessions[0].code;
                }
              }

              let linkedDiscordId = "";
              if (matchedCode) {
                const session = pendingVerificationsByCode.get(matchedCode);
                if (session) {
                  session.verified = true;
                  session.ign = ign;
                  linkedDiscordId = session.discordId;

                  // Update verified map
                  recentVerifiedAccounts.set(session.discordId, {
                    ign,
                    discordId: session.discordId,
                    verifiedAt: Date.now(),
                  });

                  // Update in-memory player
                  memoryPlayers.set(session.discordId, {
                    id: ign,
                    discordId: session.discordId,
                    ign,
                    uuid: ign,
                    region: session.region || "AS",
                  });

                  // Update Discord Member
                  if (McVerifyServer.discordClient) {
                    McVerifyServer.fulfillDiscordVerification(session.discordId, ign, session.region || "AS").catch(
                      (err) => console.warn("[MC-Verify] Failed to update Discord member:", err)
                    );
                  }

                  // Safe DB upsert if configured
                  if (isDbConfigured()) {
                    prisma.player
                      .upsert({
                        where: { discordId: session.discordId },
                        update: { ign, uuid: ign },
                        create: {
                          discordId: session.discordId,
                          ign,
                          uuid: ign,
                          region: session.region || "AS",
                          points: 0,
                        },
                      })
                      .catch(() => null);
                  }

                  console.log(`[MC-Verify] ✅ Verified IGN "${ign}" to Discord ID <@${session.discordId}> (code: ${matchedCode})`);
                }
              }

              // Send the authentic Minecraft Disconnect Packet (0x00 for Login State)
              const disconnectJson = createDisconnectReason(ign);
              const disconnectPacket = createPacket(0x00, writeString(disconnectJson));
              socket.write(disconnectPacket, () => {
                socket.end();
              });
              return;
            }
          }
        } catch (err) {
          console.warn("[MC-Verify] Error parsing packet:", err);
          socket.destroy();
        }
      });

      socket.on("error", () => {
        socket.destroy();
      });
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`[MC-Verify] Port ${port} is in use. Minecraft direct connect server will not run on ${port}.`);
      } else {
        console.warn("[MC-Verify] Server error:", err);
      }
    });

    server.listen(port, () => {
      console.log(`[MC-Verify] 🎮 Minecraft Verification Server listening on port ${port}`);
    });

    this.server = server;
  }

  /**
   * Applies nickname and Registered role to the verified member.
   */
  public static async fulfillDiscordVerification(discordId: string, ign: string, region: Region = "AS"): Promise<void> {
    if (!this.discordClient) return;
    const guilds = Array.from(this.discordClient.guilds.cache.values());
    for (const guild of guilds) {
      const member = await guild.members.fetch(discordId).catch(() => null);
      if (member) {
        const flag = REGION_MAP[region]?.flag || region;
        const newNick = `${ign} [${region}]`.slice(0, 32);
        await member.setNickname(newNick).catch(() => null);

        if (config.ROLE_REGISTERED_ID) {
          await member.roles.add(config.ROLE_REGISTERED_ID).catch(() => null);
        }
      }
    }
  }

  public static stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

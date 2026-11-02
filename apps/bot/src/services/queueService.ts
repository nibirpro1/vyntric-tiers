import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ChannelType,
  Client,
  EmbedBuilder,
  Guild,
  Message,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Kit, KIT_MAP, KITS, Region, REGION_MAP } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";
import { createBaseEmbed, VY_BRAND, VY_COLORS, MINECRAFT_ITEM_ICONS } from "../embeds/brand.js";
import { isDbConfigured } from "./mcVerifyServer.js";

export interface MemoryPlayer {
  id: string;
  discordId: string;
  ign: string;
  uuid: string;
  region: string;
}

export interface MemoryQueueEntry {
  id: string;
  discordId: string;
  playerId: string;
  ign: string;
  region: string;
  preferredServer: string;
  kit: Kit;
  position: number;
  createdAt: Date;
}

export interface ActiveTesterState {
  discordId: string;
  ign: string;
  region: Region;
  specialties: Kit[];
  status: "ONLINE" | "TESTING" | "OFFLINE";
  lastActive: Date;
}

// In-memory fallback stores
export const memoryPlayers = new Map<string, MemoryPlayer>(); // discordId -> player
export const memoryQueues = new Map<Kit, MemoryQueueEntry[]>(); // kit -> queue entries
export const activeTestersMap = new Map<string, ActiveTesterState>(); // discordId -> tester state
export const lastKitSessions = new Map<Kit, Date>(); // kit -> last testing session Date

function formatTestingSessionDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export class QueueService {
  private static panelMessages: Map<Kit, string> = new Map();

  /**
   * Sets tester online/offline status and updates last session timestamp.
   */
  public static setTesterStatus(
    discordId: string,
    state: Partial<ActiveTesterState> & { status: "ONLINE" | "TESTING" | "OFFLINE" }
  ): void {
    const existing = activeTestersMap.get(discordId);
    const updated: ActiveTesterState = {
      discordId,
      ign: state.ign || existing?.ign || "Tester",
      region: state.region || existing?.region || "AS",
      specialties: state.specialties || existing?.specialties || (KITS.map((k) => k.id) as Kit[]),
      status: state.status,
      lastActive: new Date(),
    };
    activeTestersMap.set(discordId, updated);

    if (state.status === "ONLINE" || state.status === "TESTING") {
      for (const kit of updated.specialties) {
        lastKitSessions.set(kit, new Date());
      }
    }
  }

  /**
   * Returns list of currently active testers for a given kit.
   */
  public static getActiveTestersForKit(kit: Kit): ActiveTesterState[] {
    const testers: ActiveTesterState[] = [];
    for (const t of Array.from(activeTestersMap.values())) {
      if ((t.status === "ONLINE" || t.status === "TESTING") && t.specialties.includes(kit)) {
        testers.push(t);
      }
    }
    return testers;
  }

  /**
   * Returns the last recorded testing session date for a kit.
   */
  public static getLastSessionDate(kit: Kit): Date {
    return lastKitSessions.get(kit) || new Date();
  }

  /**
   * Builds the ActionRow Buttons matching MCTiers style:
   * When No Testers Online: [Verify Account] [Enter Waitlist] [View Cooldown]
   * When Testing Open: [Join Queue (Green)] [Enter Waitlist] [View Cooldown]
   */
  public static createQueueButtons(kit: Kit): ActionRowBuilder<ButtonBuilder> {
    const activeTesters = this.getActiveTestersForKit(kit);

    if (activeTesters.length > 0) {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`waitlist_join_active_${kit}`)
          .setLabel("Join Queue")
          .setEmoji("⚔️")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`waitlist_enter_${kit}`)
          .setLabel("Enter Waitlist")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`waitlist_cooldown_${kit}`)
          .setLabel("View Cooldown")
          .setStyle(ButtonStyle.Secondary)
      );
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`waitlist_verify_${kit}`)
        .setLabel("Verify Account")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`waitlist_enter_${kit}`)
        .setLabel("Enter Waitlist")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`waitlist_cooldown_${kit}`)
        .setLabel("View Cooldown")
        .setStyle(ButtonStyle.Primary)
    );
  }

  /**
   * Builds the pop-up modal when clicking [Enter Waitlist].
   */
  public static createWaitlistModal(kit: Kit, defaultRegion = "AS"): ModalBuilder {
    const kitMeta = KIT_MAP[kit];
    const modal = new ModalBuilder()
      .setCustomId(`waitlist_modal_${kit}`)
      .setTitle(`Join ${kitMeta.name} Testing Waitlist`);

    const regionInput = new TextInputBuilder()
      .setCustomId("waitlist_region")
      .setLabel("Region (AS/AU, NA, EU, SA, ME) *")
      .setPlaceholder("e.g. AS")
      .setValue(defaultRegion)
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(5)
      .setRequired(true);

    const serverInput = new TextInputBuilder()
      .setCustomId("waitlist_server")
      .setLabel("Preferred Server *")
      .setPlaceholder("e.g. Stray, Minemen Club, Cold, PVPLand")
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(50)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(regionInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(serverInput)
    );

    return modal;
  }

  /**
   * Builds the visual embed for a kit waitlist panel matching MCTiers format.
   * Dynamically renders "No Testers Online" or "Active Queue" based on tester availability.
   */
  public static async buildQueueEmbed(kit: Kit): Promise<EmbedBuilder> {
    const kitMeta = KIT_MAP[kit];
    let waitingEntries: any[] = [];
    let playerMap = new Map<string, any>();
    const activeTesters = this.getActiveTestersForKit(kit);
    const lastSession = this.getLastSessionDate(kit);

    if (isDbConfigured()) {
      try {
        waitingEntries = await prisma.queueEntry.findMany({
          where: { kit, status: "WAITING" },
          orderBy: { createdAt: "asc" },
          take: 10,
        });

        const playerIds = waitingEntries.map((e) => e.playerId);
        if (playerIds.length > 0) {
          const players = await prisma.player.findMany({
            where: { id: { in: playerIds } },
          });
          playerMap = new Map(players.map((p) => [p.id, p]));
        }
      } catch {
        // Fallback
      }
    }

    // In-memory queue fallback
    if (waitingEntries.length === 0) {
      const memEntries = memoryQueues.get(kit) || [];
      if (memEntries.length > 0) {
        waitingEntries = memEntries.map((m) => ({
          playerId: m.playerId,
          createdAt: m.createdAt,
          preferredServer: m.preferredServer,
        }));
        for (const m of memEntries) {
          playerMap.set(m.playerId, {
            ign: m.ign,
            region: m.region,
            preferredServer: m.preferredServer,
          });
        }
      }
    }

    let queueList = "*No players currently waiting in line.*";
    if (waitingEntries.length > 0) {
      queueList = waitingEntries
        .map((entry, index) => {
          const p = playerMap.get(entry.playerId);
          const ign = p ? p.ign : "Unknown";
          const region = p ? REGION_MAP[p.region as Region]?.flag || p.region : "";
          const server = p?.preferredServer ? ` • Server: \`${p.preferredServer}\`` : "";
          const timeWaiting = Math.max(
            1,
            Math.round((Date.now() - new Date(entry.createdAt).getTime()) / 60000)
          );
          const estWait = index === 0 ? "Next in line" : `~${index * 10}m est.`;
          return `**${index + 1}.** \`${ign}\` ${region}${server} • *${timeWaiting}m* (${estWait})`;
        })
        .join("\n");
    }

    // --- STATE 1: NO TESTERS ONLINE (Screenshot 2 MCTiers Red Card) ---
    if (activeTesters.length === 0) {
      return new EmbedBuilder()
        .setColor(0xef4444) // MCTiers signature red border
        .setAuthor({
          name: `[1.21+] Minecraft ${kitMeta.name} PvP Community`,
          iconURL: MINECRAFT_ITEM_ICONS[kit],
        })
        .setTitle("No Testers Online")
        .setDescription(
          `No testers for your region are available at this time.\n` +
          `You will be pinged when a tester is available.\n` +
          `Check back later!\n\n` +
          `---\n` +
          `📝 **Evaluation Testing Waitlist (${waitingEntries.length} registered):**\n` +
          `${queueList}\n\n` +
          `ℹ️ *You can still click **[Enter Waitlist]** below to register your preferred region and server ahead of time. You will be pinged the moment testing opens!*`
        )
        .setFooter({
          text: `Last testing session: ${formatTestingSessionDate(lastSession)}`,
        });
    }

    // --- STATE 2: ACTIVE TESTING OPEN (Vibrant Green Card) ---
    const onlineTestersList = activeTesters
      .map((t) => `• **${t.ign}** [${t.region}] (${t.status === "TESTING" ? "⚔️ In Test Duel" : "🟢 Ready to Test"})`)
      .join("\n");

    return new EmbedBuilder()
      .setColor(0x22c55e) // Vibrant Green
      .setAuthor({
        name: `🟢 [1.21+] Minecraft ${kitMeta.name} PvP Community — TESTING OPEN!`,
        iconURL: MINECRAFT_ITEM_ICONS[kit],
      })
      .setTitle("⚔️ Testing Queue Open")
      .setDescription(
        `A certified tester is online and accepting evaluation duels right now!\n\n` +
        `### 🛡️ Available Testers (${activeTesters.length})\n` +
        `${onlineTestersList}\n\n` +
        `### 📋 Current Active Line (${waitingEntries.length})\n` +
        `${queueList}\n\n` +
        `🛑 **Click [Join Queue] below if you are ready to log on and test right now!**`
      )
      .setFooter({
        text: `Vyntric Tiers • ${kitMeta.name} Testing Session • Ranked. Tested. Verified.`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Finds the dedicated text channel for a given kit.
   */
  public static findChannelForKit(guild: Guild, kit: Kit): TextChannel | null {
    const kitMeta = KIT_MAP[kit];
    const kitLower = kit.toLowerCase();
    const nameLower = kitMeta.name.toLowerCase().replace(/\s+/g, "");

    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        (c.name.includes(`${kitLower}-queue`) ||
          c.name.includes(`${nameLower}-queue`) ||
          (c.name.includes(kitLower) && c.name.includes("queue")) ||
          (c.name.includes(nameLower) && c.name.includes("queue")))
    ) as TextChannel | undefined;

    return channel || null;
  }

  /**
   * Initializes or updates persistent panels in dedicated gamemode channels.
   */
  public static async setupOrRefreshPanels(client: Client, targetKit?: Kit): Promise<void> {
    try {
      const guilds = Array.from(client.guilds.cache.values());
      const kitsToProcess = targetKit ? [KIT_MAP[targetKit]] : KITS;

      for (const guild of guilds) {
        await guild.channels.fetch().catch(() => null);
        for (const kitMeta of kitsToProcess) {
          const kit = kitMeta.id;
          const channel = this.findChannelForKit(guild, kit);
          if (!channel) continue;

          const embed = await this.buildQueueEmbed(kit);
          const row = this.createQueueButtons(kit);

          let message: Message | null = null;
          const existingMessageId = this.panelMessages.get(kit);

          if (existingMessageId) {
            message = await channel.messages.fetch(existingMessageId).catch(() => null);
          }

          if (!message) {
            const recent = await channel.messages.fetch({ limit: 20 }).catch(() => null);
            if (recent) {
              for (const m of Array.from(recent.values())) {
                if (m.author.id === client.user?.id) {
                  message = m;
                  this.panelMessages.set(kit, m.id);
                  break;
                }
              }
            }
          }

          if (message) {
            await message.edit({ embeds: [embed], components: [row] }).catch(() => null);
          } else {
            const sent = await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
            if (sent) {
              this.panelMessages.set(kit, sent.id);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not setup or refresh queue panels:", err);
    }
  }

  /**
   * Handles player clicking [Join Queue] button when a tester is online.
   */
  public static async handleJoinActiveQueue(interaction: ButtonInteraction, kit: Kit): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    let ign = "";
    let uuid = "";
    let region = "AS";
    const memPlayer = memoryPlayers.get(discordId);

    if (memPlayer) {
      ign = memPlayer.ign;
      uuid = memPlayer.uuid;
      region = memPlayer.region || "AS";
    } else if (isDbConfigured()) {
      try {
        const dbPlayer = await prisma.player.findUnique({ where: { discordId } });
        if (dbPlayer) {
          ign = dbPlayer.ign;
          uuid = dbPlayer.uuid || "";
          region = dbPlayer.region || "AS";
        }
      } catch {}
    }

    if (!ign) {
      const member = interaction.guild?.members.cache.get(discordId);
      const nickMatch = member?.displayName.match(/^([a-zA-Z0-9_]{3,16})\s*\[/);
      if (nickMatch) {
        ign = nickMatch[1];
        uuid = ign;
      } else {
        await interaction.editReply({
          content: "❌ **Account Not Verified:** You must link your Minecraft account first! Click **[Verify Account]** to begin.",
        });
        return;
      }
    }

    // Check if already in queue
    const qEntries = memoryQueues.get(kit) || [];
    const existingIndex = qEntries.findIndex((e) => e.discordId === discordId);
    if (existingIndex !== -1) {
      await interaction.editReply({
        content: `ℹ️ You are already in the **${KIT_MAP[kit].name}** queue at position **#${existingIndex + 1}**! Please keep Minecraft open.`,
      });
      return;
    }

    const nextPos = qEntries.length + 1;
    qEntries.push({
      id: `queue_${Date.now()}`,
      discordId,
      playerId: uuid || ign,
      ign,
      region,
      preferredServer: "Standard",
      kit,
      position: nextPos,
      createdAt: new Date(),
    });
    memoryQueues.set(kit, qEntries);

    if (isDbConfigured()) {
      try {
        const player = await prisma.player.findUnique({ where: { discordId } });
        if (player) {
          await prisma.queueEntry.create({
            data: {
              playerId: player.id,
              kit,
              region: region as any,
              position: nextPos,
              status: "WAITING",
            },
          });
        }
      } catch {}
    }

    await this.setupOrRefreshPanels(interaction.client, kit);

    await interaction.editReply({
      content:
        `⚔️ **Joined Active Queue!**\n\n` +
        `• **Gamemode:** ${KIT_MAP[kit].name}\n` +
        `• **Queue Position:** #${nextPos}\n` +
        `• **Account:** \`${ign}\` [${region}]\n\n` +
        `When you are #1 in line, your tester will summon you into a private testing room. Have Minecraft launched!`,
    });
  }

  /**
   * Handles player submitting [Enter Waitlist] modal.
   */
  public static async handleWaitlistModalSubmit(
    interaction: ModalSubmitInteraction,
    kit: Kit
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const region = interaction.fields.getTextInputValue("waitlist_region").trim().toUpperCase();
    const preferredServer = interaction.fields.getTextInputValue("waitlist_server").trim();
    const discordId = interaction.user.id;

    // Check verification
    let ign = "";
    let uuid = "";
    const memPlayer = memoryPlayers.get(discordId);

    if (memPlayer) {
      ign = memPlayer.ign;
      uuid = memPlayer.uuid;
    } else if (isDbConfigured()) {
      try {
        const dbPlayer = await prisma.player.findUnique({ where: { discordId } });
        if (dbPlayer) {
          ign = dbPlayer.ign;
          uuid = dbPlayer.uuid || "";
        }
      } catch {}
    }

    if (!ign) {
      const member = interaction.guild?.members.cache.get(discordId);
      const nickMatch = member?.displayName.match(/^([a-zA-Z0-9_]{3,16})\s*\[/);
      if (nickMatch) {
        ign = nickMatch[1];
        uuid = ign;
      } else {
        await interaction.editReply({
          content: "❌ **Account Not Verified:** You must link your Minecraft account first! Click **[Verify Account]** on the waitlist card.",
        });
        return;
      }
    }

    // Check if already in ANY waitlist
    for (const [qKit, qEntries] of Array.from(memoryQueues.entries())) {
      if (qEntries.some((e: MemoryQueueEntry) => e.discordId === discordId || e.ign.toLowerCase() === ign.toLowerCase())) {
        const existingKit = KIT_MAP[qKit as Kit].name;
        await interaction.editReply({
          content: `⚠️ You are already in the **${existingKit}** waitlist! You must leave that waitlist before entering another.`,
        });
        return;
      }
    }

    // Add to in-memory waitlist
    const qEntries = memoryQueues.get(kit) || [];
    const nextPos = qEntries.length + 1;
    qEntries.push({
      id: `wl_${Date.now()}`,
      discordId,
      playerId: uuid || ign,
      ign,
      region,
      preferredServer,
      kit,
      position: nextPos,
      createdAt: new Date(),
    });
    memoryQueues.set(kit, qEntries);

    if (isDbConfigured()) {
      try {
        const player = await prisma.player.findUnique({ where: { discordId } });
        if (player) {
          await prisma.queueEntry.create({
            data: {
              playerId: player.id,
              kit,
              region: region as any,
              position: nextPos,
              status: "WAITING",
            },
          });
        }
      } catch {}
    }

    // Refresh queue embed in channel
    await this.setupOrRefreshPanels(interaction.client, kit);

    await interaction.editReply({
      content:
        `✅ **Waitlist Joined!**\n\n` +
        `• **Gamemode:** ${KIT_MAP[kit].name}\n` +
        `• **Position:** #${nextPos}\n` +
        `• **Region:** ${region}\n` +
        `• **Preferred Server:** \`${preferredServer}\`\n\n` +
        `A certified tester will ping you or open your ticket when ready. Please have Minecraft launched!`,
    });
  }

  /**
   * Handles player checking their cooldown.
   */
  public static async handleViewCooldown(discordId: string, kit: Kit): Promise<string> {
    const kitMeta = KIT_MAP[kit];

    if (isDbConfigured()) {
      try {
        const player = await prisma.player.findUnique({ where: { discordId } });
        if (player) {
          const cooldown = await prisma.cooldown.findUnique({
            where: { playerId_kit: { playerId: player.id, kit } },
          });

          if (cooldown && cooldown.until > new Date()) {
            const daysLeft = Math.ceil(
              (cooldown.until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const dateStr = cooldown.until.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return `⏳ **Active Cooldown:** You tested **${kitMeta.name}** recently. You can re-test on **${dateStr}** (${daysLeft} day(s) remaining).\n*Note: Cooldown is removed immediately upon promotion!*`;
          }
        }
      } catch {}
    }

    return `🟢 **No Active Cooldown:** You have no active cooldown for **${kitMeta.name}**! You are eligible to enter the waitlist immediately.`;
  }
}

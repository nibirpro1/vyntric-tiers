import {
  ChannelType,
  Guild,
  PermissionsBitField,
  Role,
  CategoryChannel,
  TextChannel,
} from "discord.js";
import fs from "fs";
import path from "path";
import { KITS, Kit, KIT_MAP } from "@vyntric/shared";
import { config } from "../config.js";
import { QueueService } from "./queueService.js";
import { VerifyService } from "./verifyService.js";
import { LadderRoleService } from "./ladderRoleService.js";

export interface SetupResult {
  roles: {
    registered: Role;
    activeTester: Role;
    headTester: Role;
    tester: Role;
    ladderRoles: Map<Kit, Role>;
  };
  categories: {
    verify: CategoryChannel;
    queues: CategoryChannel;
    tickets: CategoryChannel;
    staff: CategoryChannel;
    info: CategoryChannel;
  };
  verifyChannel: TextChannel;
  pickerChannel: TextChannel;
  queueChannels: Map<Kit, TextChannel>;
  channels: {
    results: TextChannel;
    transcripts: TextChannel;
    staffLogs: TextChannel;
  };
}

export class GuildSetupService {
  /**
   * Completely cleans up old duplicate channels and builds a pristine
   * MCTiers-standard channel, queue, role-gated ladder, and verification architecture.
   */
  public static async executeSetup(guild: Guild): Promise<SetupResult> {
    const everyoneRole = guild.roles.everyone;

    // 1. Roles Setup
    const registered = await this.getOrCreateRole(guild, "Registered", 0x22d3ee, "Vyntric Linked Player Role");
    const tester = await this.getOrCreateRole(guild, "Tester", 0x38bdf8, "Vyntric Certified Tester Role");
    const activeTester = await this.getOrCreateRole(guild, "Active Tester", 0x22c55e, "Vyntric Currently Online Tester Role");
    const headTester = await this.getOrCreateRole(guild, "Head Tester", 0x8b5cf6, "Vyntric Senior Testing Council Role");
    const ladderRoles = await LadderRoleService.getOrCreateLadderRoles(guild);

    // 2. Wipe ALL old duplicate Vyntric channels and categories cleanly
    const allChannels = await guild.channels.fetch();

    const isVyntricChannel = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes("vyntric") ||
        lower.includes("queue") ||
        lower.includes("result") ||
        lower.includes("transcript") ||
        lower.includes("staff-log") ||
        lower.includes("verify") ||
        lower.includes("gamemode") ||
        lower.includes("ticket") ||
        lower.includes("ladder") ||
        lower.includes("sword") ||
        lower.includes("axe") ||
        lower.includes("crystal") ||
        lower.includes("pot") ||
        lower.includes("uhc") ||
        lower.includes("smp") ||
        lower.includes("mace") ||
        lower.includes("diasmp") ||
        lower.includes("vanilla")
      );
    };

    // First delete text channels and non-categories
    for (const ch of Array.from(allChannels.values())) {
      if (ch && ch.type !== ChannelType.GuildCategory && isVyntricChannel(ch.name)) {
        await ch.delete("Clean Vyntric architecture wipe").catch(() => null);
      }
    }

    // Then delete category channels
    for (const ch of Array.from(allChannels.values())) {
      if (ch && ch.type === ChannelType.GuildCategory && isVyntricChannel(ch.name)) {
        await ch.delete("Clean Vyntric architecture wipe").catch(() => null);
      }
    }

    // 3. Category 1: ⛏️ VYNTRIC VERIFICATION
    const verifyCategory = await guild.channels.create({
      name: "⛏️ VYNTRIC VERIFICATION",
      type: ChannelType.GuildCategory,
    });

    // 3a. #verify channel (open to everyone to link Minecraft account)
    const verifyChannel = await guild.channels.create({
      name: "verify",
      type: ChannelType.GuildText,
      parent: verifyCategory.id,
      topic: "Official Minecraft Account Linking. Click [Verify with Minecraft] below to unlock competitive queues.",
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: guild.members.me?.id || "",
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.ManageMessages,
          ],
        },
      ],
    });

    // 3b. #pick-gamemodes channel (unlocked for Registered & Staff to pick which queue channels to reveal)
    const pickerChannel = await guild.channels.create({
      name: "pick-gamemodes",
      type: ChannelType.GuildText,
      parent: verifyCategory.id,
      topic: "Select which competitive gamemode queues you want visible in your sidebar. Update your ladders anytime.",
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: registered.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: tester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: guild.members.me?.id || "",
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.ManageMessages,
          ],
        },
      ],
    });

    // 4. Category 2: ⚔️ VYNTRIC QUEUES (Hidden by default; individual channels unlocked by kit ladder role)
    const queuesCategory = await guild.channels.create({
      name: "⚔️ VYNTRIC QUEUES",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: registered.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: tester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const queueChannels = new Map<Kit, TextChannel>();

    for (const kitMeta of KITS) {
      const channelSlug = `${kitMeta.id.toLowerCase().replace(/_/g, "")}-queue`;
      const channelTopic = `${kitMeta.emoji} Official Vyntric ${kitMeta.name} 1v1 Tier Testing Queue. Format: FT5. Click [Join Queue] below to enter.`;
      const ladderRole = ladderRoles.get(kitMeta.id);

      const overwrites: any[] = [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: registered.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: tester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: guild.members.me?.id || "",
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.ManageMessages,
          ],
        },
      ];

      if (ladderRole) {
        overwrites.push({
          id: ladderRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
          deny: [PermissionsBitField.Flags.SendMessages],
        });
      }

      const channel = await guild.channels.create({
        name: channelSlug,
        type: ChannelType.GuildText,
        parent: queuesCategory.id,
        topic: channelTopic,
        permissionOverwrites: overwrites,
      });

      queueChannels.set(kitMeta.id, channel);
    }

    // 5. Category 3: 🏆 VYNTRIC TIERS
    const infoCategory = await guild.channels.create({
      name: "🏆 VYNTRIC TIERS",
      type: ChannelType.GuildCategory,
    });

    const resultsChannel = await guild.channels.create({
      name: "results",
      type: ChannelType.GuildText,
      parent: infoCategory.id,
      topic: "Verified Vyntric duel test results and promotional announcements.",
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: guild.members.me?.id || "",
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
          ],
        },
      ],
    });

    // 6. Category 4: 🛡️ VYNTRIC DUEL TICKETS
    const ticketsCategory = await guild.channels.create({
      name: "🛡️ VYNTRIC DUEL TICKETS",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: tester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    // 7. Category 5: 🔒 VYNTRIC STAFF & LOGS
    const staffCategory = await guild.channels.create({
      name: "🔒 VYNTRIC STAFF & LOGS",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const transcriptsChannel = await guild.channels.create({
      name: "transcripts",
      type: ChannelType.GuildText,
      parent: staffCategory.id,
      topic: "Permanent text archives for concluded and cancelled duel ticket channels.",
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const staffLogsChannel = await guild.channels.create({
      name: "staff-logs",
      type: ChannelType.GuildText,
      parent: staffCategory.id,
      topic: "Audit trail for staff tier overrides, tester status changes, and bans.",
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: headTester.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    // 8. Update in-memory configuration
    const firstQueueChannel = queueChannels.get("SWORD") || queueChannels.values().next().value;
    config.QUEUE_CHANNEL_ID = firstQueueChannel?.id || "";
    config.RESULTS_CHANNEL_ID = resultsChannel.id;
    config.TRANSCRIPTS_CHANNEL_ID = transcriptsChannel.id;
    config.STAFF_LOGS_CHANNEL_ID = staffLogsChannel.id;
    config.TESTER_CATEGORY_ID = ticketsCategory.id;
    config.ROLE_REGISTERED_ID = registered.id;
    config.ROLE_ACTIVE_TESTER_ID = activeTester.id;
    config.ROLE_HEAD_TESTER_ID = headTester.id;
    config.ROLE_TESTER_ID = tester.id;

    // 9. Update .env file on disk
    this.updateEnvFile({
      QUEUE_CHANNEL_ID: firstQueueChannel?.id || "",
      RESULTS_CHANNEL_ID: resultsChannel.id,
      TRANSCRIPTS_CHANNEL_ID: transcriptsChannel.id,
      STAFF_LOGS_CHANNEL_ID: staffLogsChannel.id,
      TESTER_CATEGORY_ID: ticketsCategory.id,
      ROLE_REGISTERED_ID: registered.id,
      ROLE_ACTIVE_TESTER_ID: activeTester.id,
      ROLE_HEAD_TESTER_ID: headTester.id,
      ROLE_TESTER_ID: tester.id,
      DISCORD_GUILD_ID: guild.id,
    });

    // 10. Post MCTiers Verification Card in #verify
    await VerifyService.setupVerificationPanel(verifyChannel);

    // 11. Post Ladder Picker Dropdown in #pick-gamemodes
    await LadderRoleService.setupPickerPanel(pickerChannel);

    // 12. Deploy gamemode queue cards in each dedicated channel
    await QueueService.setupOrRefreshPanels(guild.client);

    return {
      roles: { registered, activeTester, headTester, tester, ladderRoles },
      categories: {
        verify: verifyCategory,
        queues: queuesCategory,
        tickets: ticketsCategory,
        staff: staffCategory,
        info: infoCategory,
      },
      verifyChannel,
      pickerChannel,
      queueChannels,
      channels: {
        results: resultsChannel,
        transcripts: transcriptsChannel,
        staffLogs: staffLogsChannel,
      },
    };
  }

  private static async getOrCreateRole(
    guild: Guild,
    name: string,
    color: number,
    reason: string
  ): Promise<Role> {
    const existing = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    return await guild.roles.create({
      name,
      color,
      reason,
    });
  }

  /**
   * Helper to write or replace variables in root .env.
   */
  public static updateEnvFile(updates: Record<string, string>): void {
    const potentialPaths = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), "../../.env"),
    ];

    for (const envPath of potentialPaths) {
      if (fs.existsSync(envPath)) {
        try {
          let content = fs.readFileSync(envPath, "utf-8");
          for (const [key, value] of Object.entries(updates)) {
            const regex = new RegExp(`^${key}=.*$`, "m");
            if (regex.test(content)) {
              content = content.replace(regex, `${key}="${value}"`);
            } else {
              content += `\n${key}="${value}"`;
            }
          }
          fs.writeFileSync(envPath, content, "utf-8");
          console.log(`✅ Automatically updated ${envPath} with new server IDs.`);
        } catch (err) {
          console.warn(`Could not write to ${envPath}:`, err);
        }
      }
    }
  }
}

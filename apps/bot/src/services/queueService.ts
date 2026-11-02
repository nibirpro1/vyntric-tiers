import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import { Kit, KIT_MAP, KITS, Region, REGION_MAP } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config";
import { createBaseEmbed, VY_COLORS } from "../embeds/brand";

export class QueueService {
  private static panelMessages: Map<Kit, string> = new Map();

  /**
   * Builds the interactive ActionRow for a queue panel.
   */
  public static createQueueButtons(kit: Kit): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`queue_join_${kit}`)
        .setLabel("Join Queue")
        .setEmoji("⚔️")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`queue_leave_${kit}`)
        .setLabel("Leave Queue")
        .setEmoji("🚪")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`queue_info_${kit}`)
        .setLabel("Queue Info")
        .setEmoji("ℹ️")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  /**
   * Builds the visual embed for a kit queue panel.
   */
  public static async buildQueueEmbed(kit: Kit): Promise<EmbedBuilder> {
    const kitMeta = KIT_MAP[kit];

    // Fetch active waiting players
    const waitingEntries = await prisma.queueEntry.findMany({
      where: { kit, status: "WAITING" },
      orderBy: { position: "asc" },
      take: 10,
    });

    const playerIds = waitingEntries.map((e) => e.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
    });
    const playerMap = new Map(players.map((p) => [p.id, p]));

    // Fetch online testers for this kit
    const testers = await prisma.tester.findMany({
      where: {
        status: { in: ["ONLINE", "TESTING"] },
        specialties: { has: kit },
      },
    });

    let queueList = "🟢 *Queue is currently empty. Be the first to join!*";
    if (waitingEntries.length > 0) {
      queueList = waitingEntries
        .map((entry, index) => {
          const p = playerMap.get(entry.playerId);
          const ign = p ? p.ign : "Unknown";
          const region = p ? REGION_MAP[p.region as Region]?.flag || p.region : "";
          const timeWaiting = Math.max(
            1,
            Math.round((Date.now() - new Date(entry.createdAt).getTime()) / 60000)
          );
          return `**${index + 1}.** \`${ign}\` ${region} • *${timeWaiting}m in queue*`;
        })
        .join("\n");
    }

    const onlineTestersList =
      testers.length > 0
        ? testers.map((t) => `• **${t.ign}** (${t.status === "TESTING" ? "⚔️ In Test" : "🟢 Ready"})`).join("\n")
        : "*No testers currently online for this ladder.*";

    const embed = createBaseEmbed()
      .setColor(VY_COLORS.primary)
      .setTitle(`${kitMeta.emoji} ${kitMeta.name.toUpperCase()} TIER TESTING QUEUE`)
      .setDescription(
        `**${kitMeta.shortDesc}**\n\n` +
        `### Current Waiting Line (${waitingEntries.length})\n` +
        `${queueList}\n\n` +
        `### Available Testers (${testers.length})\n` +
        `${onlineTestersList}\n\n` +
        `⏱ *Average test time: 8-12 minutes. Tests are First-to-5 duels.*`
      )
      .setFooter({
        text: `Vyntric Tiers • ${kitMeta.name} Queue • Ranked. Tested. Verified.`,
        iconURL: "https://mc-heads.net/head/MHF_Chest/64",
      });

    return embed;
  }

  /**
   * Initializes or updates persistent panels in the #queue channel.
   */
  public static async setupOrRefreshPanels(client: Client): Promise<void> {
    if (!config.QUEUE_CHANNEL_ID) return;

    try {
      const channel = await client.channels.fetch(config.QUEUE_CHANNEL_ID).catch(() => null);
      if (!channel || !(channel instanceof TextChannel)) return;

      for (const kitMeta of KITS) {
        const kit = kitMeta.id;
        const embed = await this.buildQueueEmbed(kit);
        const row = this.createQueueButtons(kit);

        const existingMessageId = this.panelMessages.get(kit);
        let message: Message | null = null;

        if (existingMessageId) {
          message = await channel.messages.fetch(existingMessageId).catch(() => null);
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
    } catch (err) {
      console.warn("Failed to initialize queue panels:", err);
    }
  }

  /**
   * Handles player joining queue.
   */
  public static async joinQueue(
    discordId: string,
    kit: Kit
  ): Promise<{ success: boolean; message: string; position?: number }> {
    // 1. Verify player is registered
    const player = await prisma.player.findUnique({
      where: { discordId },
    });

    if (!player) {
      return {
        success: false,
        message: "You must link your Minecraft account first! Use `/register <ign> <region>`.",
      };
    }

    if (player.banned) {
      return {
        success: false,
        message: "You are currently suspended from participating in official tier tests.",
      };
    }

    // 2. Check if already in ANY waiting or active queue
    const existingQueue = await prisma.queueEntry.findFirst({
      where: {
        playerId: player.id,
        status: { in: ["WAITING", "IN_TEST"] },
      },
    });

    if (existingQueue) {
      const existingKit = KIT_MAP[existingQueue.kit].name;
      return {
        success: false,
        message: `You are already waiting in the **${existingKit}** queue! Leave that queue first before joining another.`,
      };
    }

    // 3. Check Cooldown table
    const cooldown = await prisma.cooldown.findUnique({
      where: {
        playerId_kit: {
          playerId: player.id,
          kit,
        },
      },
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
      return {
        success: false,
        message: `⏳ **Cooldown Active:** You tested **${KIT_MAP[kit].name}** recently. You can re-test in **${daysLeft} day(s)** (${dateStr}).`,
      };
    }

    // 4. Calculate position and insert
    const lastEntry = await prisma.queueEntry.findFirst({
      where: { kit, status: "WAITING" },
      orderBy: { position: "desc" },
    });

    const nextPosition = (lastEntry?.position ?? 0) + 1;

    const entry = await prisma.queueEntry.create({
      data: {
        playerId: player.id,
        kit,
        region: player.region,
        position: nextPosition,
        status: "WAITING",
      },
    });

    return {
      success: true,
      message: `⚔️ You joined the **${KIT_MAP[kit].name}** testing queue at position **#${nextPosition}**! Please ensure your Minecraft client is open and ready.`,
      position: nextPosition,
    };
  }

  /**
   * Handles player leaving queue.
   */
  public static async leaveQueue(
    discordId: string,
    kit: Kit
  ): Promise<{ success: boolean; message: string }> {
    const player = await prisma.player.findUnique({
      where: { discordId },
    });

    if (!player) {
      return { success: false, message: "You are not registered in the system." };
    }

    const entry = await prisma.queueEntry.findFirst({
      where: {
        playerId: player.id,
        kit,
        status: "WAITING",
      },
    });

    if (!entry) {
      return { success: false, message: `You are not currently in the **${KIT_MAP[kit].name}** queue.` };
    }

    await prisma.queueEntry.update({
      where: { id: entry.id },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      message: `🚪 You have left the **${KIT_MAP[kit].name}** queue.`,
    };
  }
}

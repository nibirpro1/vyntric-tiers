import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Guild,
  GuildMember,
  PermissionsBitField,
  TextChannel,
  User,
} from "discord.js";
import {
  Kit,
  Tier,
  KIT_MAP,
  compareTiers,
  calculatePoints,
} from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";
import {
  createBaseEmbed,
  createResultEmbed,
  createTranscriptEmbed,
  createWarningEmbed,
  VY_COLORS,
} from "../embeds/brand.js";
import { TierService } from "./tierService.js";
import { LogService } from "./logService.js";

export class TestService {
  /**
   * ActionRow buttons for Ticket Control Panel.
   */
  public static createTicketButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_start")
        .setLabel("Start Test ⏱")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("ticket_noshow")
        .setLabel("Player No-Show")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("ticket_cancel")
        .setLabel("Cancel Test")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  /**
   * Tester claims the next player in line and opens a private ticket channel.
   */
  public static async pickNextPlayer(
    guild: Guild,
    testerMember: GuildMember,
    kit: Kit
  ): Promise<{ success: boolean; message: string; channelId?: string }> {
    // 1. Verify tester registration
    const tester = await prisma.tester.findUnique({
      where: { discordId: testerMember.id },
    });

    if (!tester) {
      return {
        success: false,
        message: "You are not registered as an official Vyntric Tester. Contact a Manager or Owner.",
      };
    }

    // 2. Find next waiting entry (chronological order)
    const entry = await prisma.queueEntry.findFirst({
      where: { kit, status: "WAITING" },
      orderBy: { createdAt: "asc" },
    });

    if (!entry) {
      return {
        success: false,
        message: `No players are currently waiting in the **${KIT_MAP[kit].name}** queue!`,
      };
    }

    const player = await prisma.player.findUnique({
      where: { id: entry.playerId },
    });

    if (!player) {
      await prisma.queueEntry.delete({ where: { id: entry.id } });
      return { success: false, message: "Queue entry referenced an invalid player ID. Cleaned up." };
    }

    // 3. Update entry to IN_TEST
    await prisma.queueEntry.update({
      where: { id: entry.id },
      data: { status: "IN_TEST" },
    });

    // 4. Update tester status to TESTING
    await prisma.tester.update({
      where: { id: tester.id },
      data: { status: "TESTING" },
    });

    // Broadcast tester status to website
    await TierService.broadcastLiveUpdate("tester_status_changed", {
      testerId: tester.id,
      ign: tester.ign,
      status: "TESTING",
    });

    // 5. Create ticket channel
    const channelName = `test-${kit.toLowerCase()}-${player.ign.toLowerCase()}`;
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: testerMember.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
      {
        id: player.discordId,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
    ];

    if (config.ROLE_HEAD_TESTER_ID) {
      permissionOverwrites.push({
        id: config.ROLE_HEAD_TESTER_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      });
    }

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: config.TESTER_CATEGORY_ID || undefined,
      permissionOverwrites,
      topic: `Vyntric PvP Tier Test | Kit: ${kit} | Tester: ${tester.ign} | Player: ${player.ign} | EntryId: ${entry.id}`,
    });

    // 6. Post initial control panel in ticket channel
    const kitMeta = KIT_MAP[kit];
    const controlEmbed = createBaseEmbed()
      .setColor(VY_COLORS.cyan)
      .setTitle(`⚔️ VYNTRIC TEST SESSION: ${kitMeta.name.toUpperCase()}`)
      .setDescription(
        `Welcome to your official competitive tier test!\n\n` +
        `**Tester:** <@${testerMember.id}> (\`${tester.ign}\`)\n` +
        `**Player:** <@${player.discordId}> (\`${player.ign}\`)\n` +
        `**Format:** First-to-5 Duels (FT5)\n` +
        `**Server:** Agree on competitive host (e.g. \`na.minemen.club\` or \`eu.minemen.club\`).\n\n` +
        `### Testing Protocol\n` +
        `• Only standard client modifications allowed (Lunar, Badlion, Feather, Vanilla).\n` +
        `• Ping equalization rules apply if latency difference > 60ms.\n` +
        `• Tester will execute \`/result tier:<tier> score:<score> [notes]\` upon match completion.`
      );

    await channel.send({
      content: `⚔️ **Test Ticket Ready!** <@${testerMember.id}> vs <@${player.discordId}>`,
      embeds: [controlEmbed],
      components: [this.createTicketButtons()],
    });

    return {
      success: true,
      message: `Opened ticket channel ${channel} for **${player.ign}** in **${kitMeta.name}**!`,
      channelId: channel.id,
    };
  }

  /**
   * Submits official test result.
   */
  public static async submitResult(
    channel: TextChannel,
    testerMember: GuildMember,
    kit: Kit,
    newTier: Tier,
    score: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. Identify player from channel topic or entry
    const topic = channel.topic || "";
    const playerIgnMatch = topic.match(/Player:\s*([^\s|]+)/i);

    if (!playerIgnMatch) {
      return {
        success: false,
        message: "This channel does not appear to be an active Vyntric test ticket channel.",
      };
    }

    const ign = playerIgnMatch[1];
    const player = await prisma.player.findUnique({
      where: { ign },
      include: { tiers: true },
    });

    if (!player) {
      return { success: false, message: `Player with IGN "${ign}" was not found in the database.` };
    }

    const tester = await prisma.tester.findUnique({
      where: { discordId: testerMember.id },
    });

    if (!tester) {
      return { success: false, message: "You are not registered as an authorized tester." };
    }

    // 2. Determine previous tier and compare
    // Note: in @vyntric/shared, compareTiers(a, b) = tierToNumber(a) - tierToNumber(b)
    // where HT1 = 1, LT1 = 2 ... LT5 = 10.
    // Therefore:
    // cmp < 0 => newTier is higher rank than previousTier => PROMOTED
    // cmp > 0 => newTier is lower rank than previousTier => DEMOTED
    // cmp === 0 => RETAINED
    const existingTierRecord = player.tiers.find((t) => t.kit === kit);
    const previousTier = existingTierRecord?.tier || null;

    let resultType: "PROMOTED" | "DEMOTED" | "RETAINED" | "NEW" = "NEW";
    if (previousTier) {
      const cmp = compareTiers(newTier, previousTier);
      if (cmp < 0) resultType = "PROMOTED";
      else if (cmp > 0) resultType = "DEMOTED";
      else resultType = "RETAINED";
    }

    const peakTier = existingTierRecord
      ? compareTiers(newTier, existingTierRecord.peakTier) < 0
        ? newTier
        : existingTierRecord.peakTier
      : newTier;

    // 3. Upsert PlayerTier
    await prisma.playerTier.upsert({
      where: {
        playerId_kit: {
          playerId: player.id,
          kit,
        },
      },
      update: {
        tier: newTier,
        peakTier,
      },
      create: {
        playerId: player.id,
        kit,
        tier: newTier,
        peakTier,
      },
    });

    // 4. Calculate total points across all kits
    const allTiers = await prisma.playerTier.findMany({
      where: { playerId: player.id },
    });

    const tierMap: Partial<Record<Kit, Tier>> = {};
    for (const t of allTiers) {
      tierMap[t.kit as Kit] = t.tier as Tier;
    }
    const totalPoints = calculatePoints(tierMap);

    await prisma.player.update({
      where: { id: player.id },
      data: { points: totalPoints },
    });

    // Calculate global rank
    const higherPlayerCount = await prisma.player.count({
      where: { points: { gt: totalPoints } },
    });
    const globalRank = higherPlayerCount + 1;

    // 5. Create Test Record
    const durationSec = Math.max(
      60,
      Math.round((Date.now() - channel.createdAt.getTime()) / 1000)
    );

    const test = await prisma.test.create({
      data: {
        playerId: player.id,
        testerId: tester.id,
        kit,
        previousTier,
        newTier,
        result: resultType,
        score,
        durationSec,
        ticketId: channel.id,
        notes: notes || null,
      },
    });

    // 6. Cooldown logic
    // PROMOTED: 14 days, RETAINED: 7 days, DEMOTED: 3 days, NEW: 7 days
    const cooldownDays =
      resultType === "PROMOTED" ? 14 : resultType === "DEMOTED" ? 3 : 7;
    const cooldownUntil = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);

    await prisma.cooldown.upsert({
      where: {
        playerId_kit: {
          playerId: player.id,
          kit,
        },
      },
      update: { until: cooldownUntil },
      create: {
        playerId: player.id,
        kit,
        until: cooldownUntil,
      },
    });

    // 7. Update tester status & tests completed
    await prisma.tester.update({
      where: { id: tester.id },
      data: {
        status: "ONLINE",
        testsCompleted: { increment: 1 },
      },
    });

    // Mark QueueEntry as DONE
    await prisma.queueEntry.updateMany({
      where: {
        playerId: player.id,
        kit,
        status: "IN_TEST",
      },
      data: { status: "DONE" },
    });

    // 8. Update Discord Roles
    const playerMember = await channel.guild.members.fetch(player.discordId).catch(() => null);
    if (playerMember) {
      await TierService.syncPlayerTierRole(
        channel.guild,
        playerMember,
        kit,
        newTier,
        previousTier
      );
      await TierService.syncTitleRole(channel.guild, playerMember, totalPoints);
    }

    // 9. Post Result Announcement to #results channel
    const profileUrl = `${config.WEBSITE_URL}/player/${player.ign}`;
    const resultEmbed = createResultEmbed({
      ign: player.ign,
      uuid: player.uuid,
      kit,
      previousTier,
      newTier,
      score,
      testerName: tester.name,
      notes,
      totalPoints,
      globalRank,
      result: resultType,
      profileUrl,
    });

    if (config.RESULTS_CHANNEL_ID) {
      const resultsChannel = await channel.guild.channels
        .fetch(config.RESULTS_CHANNEL_ID)
        .catch(() => null);
      if (resultsChannel && resultsChannel instanceof TextChannel) {
        await resultsChannel.send({ embeds: [resultEmbed] }).catch(() => null);
      }
    }

    // 10. Audit log to #staff-logs
    await LogService.logAction(
      channel.client,
      "Test Completed",
      `**Tester:** ${tester.name} (\`${tester.ign}\`)\n` +
      `**Player:** \`${player.ign}\` (<@${player.discordId}>)\n` +
      `**Ladder:** ${kit}\n` +
      `**Result:** ${previousTier || "None"} ➔ **${newTier}** (${resultType})\n` +
      `**Score:** ${score}\n` +
      `**Duration:** ${Math.round(durationSec / 60)}m`
    );

    // 11. Broadcast Real-time event for the website
    await TierService.broadcastLiveUpdate("test_completed", {
      testId: test.id,
      playerIgn: player.ign,
      kit,
      newTier,
      previousTier,
      result: resultType,
      totalPoints,
      globalRank,
    });

    // 12. Archive transcript before channel self-destructs
    await this.archiveTranscript(
      channel,
      tester.name,
      player.ign,
      kit,
      `Completed (${newTier} - ${resultType})`
    );

    // 13. Send conclusion notice & schedule ticket channel deletion
    await channel.send({
      embeds: [
        createBaseEmbed("✅ Test Finalized & Recorded")
          .setColor(VY_COLORS.green)
          .setDescription(
            `Tier updated to **${newTier}** (${resultType})!\n` +
            `Cooldown set to **${cooldownDays} days**.\n\n` +
            `🔒 *This ticket channel will automatically self-destruct in 15 seconds.*`
          ),
      ],
    });

    setTimeout(async () => {
      await channel.delete("Test completed and transcript saved").catch(() => null);
    }, 15000);

    return {
      success: true,
      message: `Successfully recorded result: **${player.ign}** is now **${newTier}** in **${KIT_MAP[kit].name}**!`,
    };
  }

  /**
   * Generates and archives a complete transcript of the ticket channel.
   */
  public static async archiveTranscript(
    channel: TextChannel,
    testerName: string,
    playerIgn: string,
    kit: Kit,
    outcome: string
  ): Promise<void> {
    if (!config.TRANSCRIPTS_CHANNEL_ID) return;

    try {
      const transcriptsChannel = await channel.guild.channels
        .fetch(config.TRANSCRIPTS_CHANNEL_ID)
        .catch(() => null);

      if (!transcriptsChannel || !(transcriptsChannel instanceof TextChannel)) return;

      // Fetch up to 100 recent messages
      const fetched = await channel.messages.fetch({ limit: 100 }).catch(() => null);
      if (!fetched || fetched.size === 0) return;

      const sortedMessages = Array.from(fetched.values()).reverse();
      let transcriptText = `=====================================================\n`;
      transcriptText += `VYNTRIC TIERS — DUEL TICKET TRANSCRIPT\n`;
      transcriptText += `Channel: #${channel.name}\n`;
      transcriptText += `Ladder: ${kit}\n`;
      transcriptText += `Tester: ${testerName}\n`;
      transcriptText += `Player: ${playerIgn}\n`;
      transcriptText += `Outcome: ${outcome}\n`;
      transcriptText += `Date: ${new Date().toISOString()}\n`;
      transcriptText += `Total Messages: ${sortedMessages.length}\n`;
      transcriptText += `=====================================================\n\n`;

      for (const msg of sortedMessages) {
        const time = msg.createdAt.toISOString().replace("T", " ").replace("Z", "");
        const author = `${msg.author.tag} (${msg.author.id})`;
        const content = msg.cleanContent || (msg.embeds.length > 0 ? `[Embed: ${msg.embeds[0].title || "Embedded Content"}]` : "[Attachment/Empty]");
        transcriptText += `[${time}] ${author}:\n${content}\n\n`;
      }

      const buffer = Buffer.from(transcriptText, "utf-8");
      const attachment = new AttachmentBuilder(buffer, {
        name: `transcript-${channel.name}.txt`,
      });

      const summaryEmbed = createTranscriptEmbed({
        channelName: channel.name,
        testerName,
        playerIgn,
        kit,
        outcome,
        messageCount: sortedMessages.length,
      });

      await transcriptsChannel.send({
        embeds: [summaryEmbed],
        files: [attachment],
      });
    } catch (err) {
      console.warn("Failed to archive duel ticket transcript:", err);
    }
  }

  /**
   * Handles cancellation, player no-show, or early ticket close.
   * Releases tester back to ONLINE and sets queue entry to CANCELLED.
   */
  public static async handleTicketCancellation(
    channel: TextChannel,
    initiator: User,
    reason: "NO_SHOW" | "CANCELLED" | "MANUAL_CLOSE"
  ): Promise<void> {
    const topic = channel.topic || "";
    const playerIgnMatch = topic.match(/Player:\s*([^\s|]+)/i);
    const kitMatch = topic.match(/Kit:\s*([^\s|]+)/i);
    const testerIgnMatch = topic.match(/Tester:\s*([^\s|]+)/i);

    const playerIgn = playerIgnMatch ? playerIgnMatch[1] : "Unknown";
    const kit = (kitMatch ? kitMatch[1] : "SWORD") as Kit;
    const testerIgn = testerIgnMatch ? testerIgnMatch[1] : initiator.username;

    // 1. Release tester back to ONLINE
    if (testerIgnMatch) {
      await prisma.tester.updateMany({
        where: { ign: testerIgnMatch[1], status: "TESTING" },
        data: { status: "ONLINE" },
      });
    }

    // 2. Mark active IN_TEST queue entry as CANCELLED
    if (playerIgnMatch) {
      const player = await prisma.player.findUnique({ where: { ign: playerIgnMatch[1] } });
      if (player) {
        await prisma.queueEntry.updateMany({
          where: { playerId: player.id, kit, status: "IN_TEST" },
          data: { status: "CANCELLED" },
        });
      }
    }

    // 3. Log action to staff logs
    const actionLabel =
      reason === "NO_SHOW"
        ? "Player No-Show"
        : reason === "CANCELLED"
        ? "Test Cancelled"
        : "Ticket Closed";

    await LogService.logAction(
      channel.client,
      actionLabel,
      `<@${initiator.id}> ended duel session in #${channel.name}.\n` +
      `**Challenger:** \`${playerIgn}\`\n` +
      `**Ladder:** ${kit}\n` +
      `**Reason:** ${actionLabel}`,
      VY_COLORS.warning
    );

    // 4. Archive transcript
    await this.archiveTranscript(
      channel,
      testerIgn,
      playerIgn,
      kit,
      actionLabel
    );

    // 5. Notify inside channel and delete
    await channel.send({
      embeds: [
        createWarningEmbed(
          actionLabel,
          `This duel ticket has been concluded (${actionLabel}).\n` +
          `Queue status and tester availability have been updated.\n\n` +
          `🔒 *Channel closing in 5 seconds...*`
        ),
      ],
    }).catch(() => null);

    setTimeout(async () => {
      await channel.delete(`Duel ticket closed: ${actionLabel}`).catch(() => null);
    }, 5000);
  }
}

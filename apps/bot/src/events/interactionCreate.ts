import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  TextChannel,
} from "discord.js";
import { Kit, KIT_MAP } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { createBaseEmbed, createErrorEmbed, createSuccessEmbed, VY_COLORS } from "../embeds/brand";
import { QueueService } from "../services/queueService";
import { LogService } from "../services/logService";

// Map of loaded commands
import * as registerCmd from "../commands/register";
import * as testerCmd from "../commands/tester";
import * as nextCmd from "../commands/next";
import * as resultCmd from "../commands/result";
import * as profileCmd from "../commands/profile";
import * as leaderboardCmd from "../commands/leaderboard";
import * as queueCmd from "../commands/queue";
import * as cooldownCmd from "../commands/cooldown";
import * as testersCmd from "../commands/testers";
import * as adminCmd from "../commands/admin";

export const commands = new Map<string, any>([
  [registerCmd.data.name, registerCmd],
  [testerCmd.data.name, testerCmd],
  [nextCmd.data.name, nextCmd],
  [resultCmd.data.name, resultCmd],
  [profileCmd.data.name, profileCmd],
  [leaderboardCmd.data.name, leaderboardCmd],
  [queueCmd.data.name, queueCmd],
  [cooldownCmd.data.name, cooldownCmd],
  [testersCmd.data.name, testersCmd],
  [adminCmd.data.name, adminCmd],
]);

export async function handleInteraction(interaction: Interaction) {
  // 1. Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const cmd = commands.get(interaction.commandName);
    if (!cmd) {
      console.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error(`Error executing ${interaction.commandName}:`, err);
      const replyMethod = interaction.deferred || interaction.replied ? "editReply" : "reply";
      await interaction[replyMethod]({
        embeds: [createErrorEmbed("Command Error", "An unexpected error occurred while executing this command.")],
        ephemeral: true,
      }).catch(() => null);
    }
    return;
  }

  // 2. Handle Button Interactions
  if (interaction.isButton()) {
    await handleButton(interaction);
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // --- QUEUE BUTTONS ---
  if (customId.startsWith("queue_join_")) {
    const kit = customId.replace("queue_join_", "") as Kit;
    await interaction.deferReply({ ephemeral: true });

    const result = await QueueService.joinQueue(interaction.user.id, kit);
    if (!result.success) {
      return interaction.editReply({
        embeds: [createErrorEmbed("Cannot Join Queue", result.message)],
      });
    }

    await QueueService.setupOrRefreshPanels(interaction.client);
    return interaction.editReply({
      embeds: [createSuccessEmbed("Queue Joined", result.message)],
    });
  }

  if (customId.startsWith("queue_leave_")) {
    const kit = customId.replace("queue_leave_", "") as Kit;
    await interaction.deferReply({ ephemeral: true });

    const result = await QueueService.leaveQueue(interaction.user.id, kit);
    if (!result.success) {
      return interaction.editReply({
        embeds: [createErrorEmbed("Cannot Leave Queue", result.message)],
      });
    }

    await QueueService.setupOrRefreshPanels(interaction.client);
    return interaction.editReply({
      embeds: [createSuccessEmbed("Queue Left", result.message)],
    });
  }

  if (customId.startsWith("queue_info_")) {
    const kit = customId.replace("queue_info_", "") as Kit;
    const kitMeta = KIT_MAP[kit];

    const embed = createBaseEmbed(`${kitMeta.emoji} ${kitMeta.name} Testing Protocol`)
      .setColor(VY_COLORS.cyan)
      .setDescription(
        `### Ladder Guidelines\n` +
        `• **Format:** First-to-5 Duels (FT5).\n` +
        `• **Average Duration:** 8-15 minutes.\n` +
        `• **Allowed Clients:** Lunar, Badlion, Feather, Vanilla, Fabric (standard competitive mods only).\n` +
        `• **Ping Rules:** If latency difference exceeds 60ms, duel on neutral or balanced host.\n\n` +
        `### Cooldown Policies\n` +
        `• **Promotion:** 14-day ladder cooldown.\n` +
        `• **Retention / Failure:** 7-day ladder cooldown.\n` +
        `• **Demotion:** 3-day ladder cooldown.`
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // --- TICKET BUTTONS ---
  if (customId === "ticket_start") {
    return interaction.reply({
      content: `⏱ **Test Commenced!** Tester <@${interaction.user.id}> has started the duel timer. Best of luck!`,
    });
  }

  if (customId === "ticket_noshow") {
    if (!(interaction.channel instanceof TextChannel)) return;
    await interaction.reply({
      content: `⚠️ **Player marked as No-Show.** This ticket will close in 10 seconds.`,
    });

    await LogService.logAction(
      interaction.client,
      "Test No-Show",
      `Tester <@${interaction.user.id}> marked ticket ${interaction.channel.name} as a Player No-Show.`
    );

    setTimeout(async () => {
      await interaction.channel?.delete("Player no-show").catch(() => null);
    }, 10000);
    return;
  }

  if (customId === "ticket_cancel" || customId === "ticket_close") {
    if (!(interaction.channel instanceof TextChannel)) return;
    await interaction.reply({
      content: `🔒 **Closing ticket channel in 5 seconds...**`,
    });

    setTimeout(async () => {
      await interaction.channel?.delete("Ticket closed by user").catch(() => null);
    }, 5000);
    return;
  }
}

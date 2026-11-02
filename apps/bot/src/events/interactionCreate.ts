import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Kit, KIT_MAP } from "@vyntric/shared";
import { config } from "../config.js";
import {
  createBaseEmbed,
  createErrorEmbed,
  createSuccessEmbed,
  VY_BRAND,
  VY_COLORS,
} from "../embeds/brand.js";
import { QueueService } from "../services/queueService.js";
import { TestService } from "../services/testService.js";

// Map of loaded commands
import * as registerCmd from "../commands/register.js";
import * as testerCmd from "../commands/tester.js";
import * as nextCmd from "../commands/next.js";
import * as resultCmd from "../commands/result.js";
import * as profileCmd from "../commands/profile.js";
import * as leaderboardCmd from "../commands/leaderboard.js";
import * as queueCmd from "../commands/queue.js";
import * as cooldownCmd from "../commands/cooldown.js";
import * as testersCmd from "../commands/testers.js";
import * as adminCmd from "../commands/admin.js";
import * as helpCmd from "../commands/help.js";

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
  [helpCmd.data.name, helpCmd],
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
        `• **Average Duration:** 8–15 minutes.\n` +
        `• **Allowed Clients:** Lunar, Badlion, Feather, Vanilla, Fabric (standard competitive mods only).\n` +
        `• **Ping Rules:** If latency difference exceeds 60ms, duel on neutral or balanced host.\n\n` +
        `### Cooldown Policies\n` +
        `• **Promotion:** 14-day ladder cooldown.\n` +
        `• **Retention / Failure:** 7-day ladder cooldown.\n` +
        `• **Demotion:** 3-day ladder cooldown.\n\n` +
        `*Click [Join Queue] on the main panel when you are warmed up and ready!*`
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // --- TICKET CONTROL BUTTONS ---
  if (!(interaction.channel instanceof TextChannel)) return;

  const topic = interaction.channel.topic || "";
  const isTicketChannel = topic.toLowerCase().includes("vyntric pvp tier test");

  if (!isTicketChannel) {
    return interaction.reply({
      embeds: [createErrorEmbed("Invalid Action", "This button can only be used inside a Vyntric test ticket channel.")],
      ephemeral: true,
    });
  }

  // Permission check: Tester, Head Tester, or Admin
  const isStaff =
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
    (config.ROLE_HEAD_TESTER_ID &&
      interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(config.ROLE_HEAD_TESTER_ID)) ||
    (config.ROLE_TESTER_ID &&
      interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(config.ROLE_TESTER_ID));

  if (customId === "ticket_start") {
    return interaction.reply({
      content: `⏱ **Test Commenced!** Tester <@${interaction.user.id}> has officially started the duel timer. Best of luck to both combatants!`,
    });
  }

  if (customId === "ticket_noshow") {
    if (!isStaff) {
      return interaction.reply({
        embeds: [createErrorEmbed("Permission Denied", "Only the assigned tester or staff may mark a player as no-show.")],
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    await TestService.handleTicketCancellation(
      interaction.channel,
      interaction.user,
      "NO_SHOW"
    );
    await QueueService.setupOrRefreshPanels(interaction.client);
    return;
  }

  if (customId === "ticket_cancel") {
    if (!isStaff) {
      return interaction.reply({
        embeds: [createErrorEmbed("Permission Denied", "Only the tester or staff may cancel an active test.")],
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    await TestService.handleTicketCancellation(
      interaction.channel,
      interaction.user,
      "CANCELLED"
    );
    await QueueService.setupOrRefreshPanels(interaction.client);
    return;
  }

  if (customId === "ticket_close") {
    await interaction.deferReply();
    await TestService.handleTicketCancellation(
      interaction.channel,
      interaction.user,
      "MANUAL_CLOSE"
    );
    await QueueService.setupOrRefreshPanels(interaction.client);
    return;
  }
}

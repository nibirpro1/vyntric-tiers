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
  createWarningEmbed,
  VY_BRAND,
  VY_COLORS,
} from "../embeds/brand.js";
import { QueueService, memoryPlayers } from "../services/queueService.js";
import { TestService } from "../services/testService.js";
import { VerifyService } from "../services/verifyService.js";
import { LadderRoleService } from "../services/ladderRoleService.js";
import { SupportTicketService } from "../services/supportTicketService.js";
import { recentVerifiedAccounts } from "../services/mcVerifyServer.js";

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
import * as testCmd from "../commands/test.js";
import * as closeCmd from "../commands/close.js";
import * as leaveCmd from "../commands/leave.js";

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
  [testCmd.data.name, testCmd],
  [closeCmd.data.name, closeCmd],
  [leaveCmd.data.name, leaveCmd],
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
    return;
  }

  // 3. Handle Modal Submissions (MCTiers Verification & Waitlist)
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "mctiers_verify_modal") {
      await VerifyService.handleVerifyModalSubmit(interaction);
    } else if (interaction.customId.startsWith("waitlist_modal_")) {
      const kit = interaction.customId.replace("waitlist_modal_", "") as Kit;
      await QueueService.handleWaitlistModalSubmit(interaction, kit);
    }
    return;
  }

  // 4. Handle String Select Menus (Gamemode picker & Support Tickets)
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ladder_role_select") {
      await LadderRoleService.handleLadderSelect(interaction);
    } else if (interaction.customId === "support_ticket_select") {
      await SupportTicketService.handleTicketSelect(interaction);
    }
    return;
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // --- MCTIERS DIRECT CONNECT & VERIFICATION BUTTONS (Screenshot 3) ---
  if (customId.startsWith("waitlist_verify_") || customId === "mctiers_verify_open") {
    const memPlayer = memoryPlayers.get(interaction.user.id);
    if (memPlayer) {
      return interaction.reply({
        content: `✅ You are already verified as **${memPlayer.ign}** [${memPlayer.region}]! Click **[Enter Waitlist]** directly.`,
        ephemeral: true,
      });
    }

    const embed = VerifyService.createDirectConnectEmbed(interaction.user.id);
    const row = VerifyService.createDirectConnectButtons();
    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }

  if (customId === "verify_instant_modal") {
    return interaction.showModal(VerifyService.createVerifyModal());
  }

  if (customId === "verify_check_status") {
    const memPlayer = memoryPlayers.get(interaction.user.id);
    const verifiedRecent = recentVerifiedAccounts.get(interaction.user.id);
    if (memPlayer || verifiedRecent) {
      const ign = memPlayer?.ign || verifiedRecent?.ign;
      return interaction.reply({
        embeds: [
          createSuccessEmbed(
            "Account Verified!",
            `✅ Successfully linked to **${ign}**! You can now click **[Enter Waitlist]** or **[Join Queue]** on any ladder panel.`
          ),
        ],
        ephemeral: true,
      });
    }

    return interaction.reply({
      embeds: [
        createWarningEmbed(
          "Not Connected Yet",
          `No direct connection was received from Minecraft yet.\n\n` +
          `• Open Minecraft Multiplayer -> Direct Connection.\n` +
          `• Connect to the address provided above.\n` +
          `• Or click **Instant Verify** to link immediately without opening Minecraft!`
        ),
      ],
      ephemeral: true,
    });
  }

  // --- ACTIVE QUEUE JOIN (When Tester is Online) ---
  if (customId.startsWith("waitlist_join_active_")) {
    const kit = customId.replace("waitlist_join_active_", "") as Kit;
    await QueueService.handleJoinActiveQueue(interaction, kit);
    return;
  }

  // --- ENTER WAITLIST MODAL ---
  if (customId.startsWith("waitlist_enter_")) {
    const kit = customId.replace("waitlist_enter_", "") as Kit;
    const memPlayer = memoryPlayers.get(interaction.user.id);
    const defaultReg = memPlayer?.region || "AS";
    return interaction.showModal(QueueService.createWaitlistModal(kit, defaultReg));
  }

  // --- VIEW COOLDOWN ---
  if (customId.startsWith("waitlist_cooldown_")) {
    const kit = customId.replace("waitlist_cooldown_", "") as Kit;
    await interaction.deferReply({ ephemeral: true });
    const msg = await QueueService.handleViewCooldown(interaction.user.id, kit);
    return interaction.editReply({ content: msg });
  }

  // --- SUPPORT TICKET CLOSE BUTTON ---
  if (customId === "ticket_close_btn") {
    await SupportTicketService.handleCloseTicket(interaction);
    return;
  }

  // --- LADDER QUICK TOGGLE BUTTONS ---
  if (customId === "ladder_unlock_all") {
    await LadderRoleService.handleUnlockAll(interaction);
    return;
  }

  if (customId === "ladder_hide_all") {
    await LadderRoleService.handleHideAll(interaction);
    return;
  }

  if (customId === "mctiers_verify_help") {
    const helpEmbed = createBaseEmbed("⛏️ Minecraft Verification Guide")
      .setColor(VY_COLORS.cyan)
      .setDescription(
        `### Why do I need to verify?\n` +
        `Linking your Minecraft username confirms your in-game identity and allows testers to ratify results to your official dossier.\n\n` +
        `### Instructions:\n` +
        `1. Click the green **[Verify Account]** button.\n` +
        `2. Direct Connect in Minecraft Java Edition to the server address provided, or choose **Instant Verify**.\n` +
        `3. In Minecraft, you will be disconnected with: \`Account Verified ({IGN})\`.\n` +
        `4. Return to Discord and click **[Enter Waitlist]** or **[Join Queue]**!\n\n` +
        `Once verified, your nickname updates automatically and all gamemode queue channels will be accessible!`
      );
    return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }

  // --- LEGACY QUEUE INFO BUTTON ---
  if (customId.startsWith("queue_info_")) {
    const kit = customId.replace("queue_info_", "") as Kit;
    const kitMeta = KIT_MAP[kit];

    const embed = createBaseEmbed(`${kitMeta.emoji} ${kitMeta.name} Testing Protocol`)
      .setColor(VY_COLORS.cyan)
      .setDescription(
        `### Ladder Guidelines\n` +
        `• **Format:** First-to-5 Duels (FT5).\n` +
        `• **Average Duration:** 8–15 minutes.\n` +
        `• **Ruleset:** Tier testing requires standard Vyntric competitive rules. Refusing fair duel parameters or unsportsmanlike conduct results in an automatic forfeiture.`
      );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

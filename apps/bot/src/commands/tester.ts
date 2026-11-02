import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";
import { createErrorEmbed, createSuccessEmbed, VY_COLORS } from "../embeds/brand.js";
import { LogService } from "../services/logService.js";
import { TierService } from "../services/tierService.js";
import { QueueService, memoryPlayers } from "../services/queueService.js";
import { isDbConfigured } from "../services/mcVerifyServer.js";
import { KITS, Kit, Region } from "@vyntric/shared";

export const data = new SlashCommandBuilder()
  .setName("tester")
  .setDescription("Manage your active tester status")
  .addSubcommand((sub) =>
    sub.setName("online").setDescription("Set your status to ONLINE (ready to accept tests)")
  )
  .addSubcommand((sub) =>
    sub.setName("offline").setDescription("Set your status to OFFLINE")
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const subcommand = interaction.options.getSubcommand();
  const isOnline = subcommand === "online";
  const newStatus = isOnline ? "ONLINE" : "OFFLINE";

  const member = interaction.guild?.members.cache.get(interaction.user.id);
  const hasTesterRole =
    member &&
    (member.roles.cache.has(config.ROLE_TESTER_ID) ||
      member.roles.cache.has(config.ROLE_HEAD_TESTER_ID) ||
      member.roles.cache.has(config.ROLE_OWNER_ID) ||
      member.permissions.has(PermissionFlagsBits.Administrator));

  let tester: any = null;
  if (isDbConfigured()) {
    try {
      tester = await prisma.tester.findUnique({
        where: { discordId: interaction.user.id },
      });
    } catch {}
  }

  if (!tester && !hasTesterRole) {
    return interaction.editReply({
      embeds: [
        createErrorEmbed(
          "Access Denied",
          "You do not have the Tester role or permission in Vyntric Tiers. Only authorized staff may toggle tester status."
        ),
      ],
    });
  }

  const ign =
    tester?.ign ||
    memoryPlayers.get(interaction.user.id)?.ign ||
    member?.displayName.split("[")[0]?.trim() ||
    interaction.user.username;

  const region = (tester?.region || memoryPlayers.get(interaction.user.id)?.region || "AS") as Region;
  const specialties = (tester?.specialties as Kit[]) || (KITS.map((k) => k.id) as Kit[]);

  // Update in-memory QueueService tester state
  QueueService.setTesterStatus(interaction.user.id, {
    ign,
    region,
    specialties,
    status: newStatus,
  });

  // Safe DB update
  if (tester && isDbConfigured()) {
    try {
      await prisma.tester.update({
        where: { id: tester.id },
        data: { status: newStatus },
      });
    } catch {}
  }

  // Discord role toggle
  if (member && config.ROLE_ACTIVE_TESTER_ID) {
    if (isOnline) {
      await member.roles.add(config.ROLE_ACTIVE_TESTER_ID).catch(() => null);
    } else {
      await member.roles.remove(config.ROLE_ACTIVE_TESTER_ID).catch(() => null);
    }
  }

  // Broadcast to website
  await TierService.broadcastLiveUpdate("tester_status_changed", {
    testerId: tester?.id || interaction.user.id,
    ign,
    status: newStatus,
  });

  // Log to staff channel
  await LogService.logAction(
    interaction.client,
    `Tester Status: ${newStatus}`,
    `<@${interaction.user.id}> (\`${ign}\`) is now **${newStatus}**.`
  );

  // Refresh all queue panels dynamically (switches from No Testers Online to Testing Open)
  await QueueService.setupOrRefreshPanels(interaction.client);

  const embed = createSuccessEmbed(
    `Status Updated: ${newStatus}`,
    isOnline
      ? `🟢 You are now marked as **ONLINE**! Queue channels have been updated to **Testing Open** with the \`[Join Queue]\` button active. When ready, run \`/test\` to claim the next waiting player!`
      : `⚪ You are now marked as **OFFLINE**. Queue channels have been reverted to **No Testers Online**.`
  ).setColor(isOnline ? VY_COLORS.green : VY_COLORS.neutral);

  return interaction.editReply({ embeds: [embed] });
}

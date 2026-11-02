import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";
import { createErrorEmbed, createSuccessEmbed, VY_COLORS } from "../embeds/brand.js";
import { LogService } from "../services/logService.js";
import { TierService } from "../services/tierService.js";

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

  // Check if user is a registered tester
  const tester = await prisma.tester.findUnique({
    where: { discordId: interaction.user.id },
  });

  if (!tester) {
    return interaction.editReply({
      embeds: [
        createErrorEmbed(
          "Access Denied",
          "You are not registered in the Vyntric Tester roster. Only authorized staff may toggle tester status."
        ),
      ],
    });
  }

  const newStatus = isOnline ? "ONLINE" : "OFFLINE";

  await prisma.tester.update({
    where: { id: tester.id },
    data: { status: newStatus },
  });

  // Role toggle
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member && config.ROLE_ACTIVE_TESTER_ID) {
    if (isOnline) {
      await member.roles.add(config.ROLE_ACTIVE_TESTER_ID).catch(() => null);
    } else {
      await member.roles.remove(config.ROLE_ACTIVE_TESTER_ID).catch(() => null);
    }
  }

  // Broadcast to website
  await TierService.broadcastLiveUpdate("tester_status_changed", {
    testerId: tester.id,
    ign: tester.ign,
    status: newStatus,
  });

  await LogService.logAction(
    interaction.client,
    `Tester Status: ${newStatus}`,
    `<@${interaction.user.id}> (\`${tester.ign}\`) is now **${newStatus}**.`
  );

  const embed = createSuccessEmbed(
    `Status Updated: ${newStatus}`,
    isOnline
      ? `🟢 You are now marked as **ONLINE**. Run \`/next kit:<kit>\` or check the dashboard when ready to claim a waiting player.`
      : `⚪ You are now marked as **OFFLINE**. You will not be queued for new tests.`
  ).setColor(isOnline ? VY_COLORS.green : VY_COLORS.neutral);

  return interaction.editReply({ embeds: [embed] });
}

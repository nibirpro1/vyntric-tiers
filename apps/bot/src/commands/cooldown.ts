import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { Kit, KIT_MAP } from "@vyntric/shared";
import { createBaseEmbed, createErrorEmbed, VY_COLORS } from "../embeds/brand";

export const data = new SlashCommandBuilder()
  .setName("cooldown")
  .setDescription("Check re-test cooldowns for yourself or another player")
  .addStringOption((option) =>
    option.setName("ign").setDescription("Minecraft username (optional)").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const targetIgn = interaction.options.getString("ign")?.trim();

  let player = null;
  if (targetIgn) {
    player = await prisma.player.findUnique({ where: { ign: targetIgn } });
  } else {
    player = await prisma.player.findUnique({ where: { discordId: interaction.user.id } });
  }

  if (!player) {
    return interaction.editReply({
      embeds: [createErrorEmbed("Player Not Found", "Player is not registered in Vyntric Tiers.")],
    });
  }

  const cooldowns = await prisma.cooldown.findMany({
    where: {
      playerId: player.id,
      until: { gt: new Date() },
    },
  });

  if (cooldowns.length === 0) {
    return interaction.editReply({
      embeds: [
        createBaseEmbed("⏳ Re-Test Cooldowns")
          .setColor(VY_COLORS.green)
          .setDescription(`**${player.ign}** has **no active cooldowns**! You are eligible to test in all 9 ladders.`),
      ],
    });
  }

  const lines = cooldowns
    .map((c) => {
      const kitMeta = KIT_MAP[c.kit as Kit];
      const daysLeft = Math.ceil((c.until.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const dateStr = c.until.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${kitMeta.emoji} **${kitMeta.name}:** \`${daysLeft}d left\` *(Expires ${dateStr})*`;
    })
    .join("\n");

  const embed = createBaseEmbed("⏳ Active Re-Test Cooldowns")
    .setColor(VY_COLORS.gold)
    .setDescription(
      `Cooldowns for **${player.ign}**:\n\n${lines}\n\n*Cooldowns prevent spam and ensure rankings reflect consistent mastery.*`
    );

  return interaction.editReply({ embeds: [embed] });
}

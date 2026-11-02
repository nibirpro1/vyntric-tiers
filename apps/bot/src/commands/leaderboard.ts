import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { KITS, Kit, KIT_MAP, REGIONS, Region, REGION_MAP } from "@vyntric/shared";
import { createBaseEmbed, VY_COLORS } from "../embeds/brand";
import { config } from "../config";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View top ranked PvP combatants across Vyntric ladders")
  .addStringOption((option) =>
    option
      .setName("kit")
      .setDescription("Filter by specific kit ladder")
      .setRequired(false)
      .addChoices(
        KITS.map((k) => ({
          name: `${k.emoji} ${k.name}`,
          value: k.id,
        }))
      )
  )
  .addStringOption((option) =>
    option
      .setName("region")
      .setDescription("Filter by region")
      .setRequired(false)
      .addChoices(
        REGIONS.map((r) => ({
          name: `${r.flag} ${r.name}`,
          value: r.id,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const kit = interaction.options.getString("kit") as Kit | null;
  const region = interaction.options.getString("region") as Region | null;

  if (kit) {
    // Kit-specific leaderboard
    const tiers = await prisma.playerTier.findMany({
      where: {
        kit,
        ...(region ? { player: { region } } : {}),
      },
      include: { player: true },
      take: 10,
    });

    const lines =
      tiers.length > 0
        ? tiers
            .map((t, index) => {
              const rFlag = REGION_MAP[t.player.region as Region]?.flag || "";
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**#${index + 1}**`;
              return `${medal} \`${t.player.ign}\` ${rFlag} — **\`${t.tier}\`** *(Peak: ${t.peakTier})*`;
            })
            .join("\n")
        : "*No ranked players found for this ladder filter.*";

    const embed = createBaseEmbed()
      .setColor(VY_COLORS.cyan)
      .setTitle(`🏆 ${KIT_MAP[kit].name.toUpperCase()} LADDER LEADERBOARD`)
      .setDescription(
        `${region ? `Region: **${region}**\n\n` : ""}${lines}\n\n` +
        `🔗 [View Full Web Standings](${config.WEBSITE_URL})`
      );

    return interaction.editReply({ embeds: [embed] });
  }

  // Global Points Leaderboard
  const players = await prisma.player.findMany({
    where: region ? { region } : {},
    orderBy: { points: "desc" },
    take: 10,
  });

  const lines =
    players.length > 0
      ? players
          .map((p, index) => {
            const rFlag = REGION_MAP[p.region as Region]?.flag || "";
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**#${index + 1}**`;
            return `${medal} \`${p.ign}\` ${rFlag} — **${p.points} pts**`;
          })
          .join("\n")
      : "*No registered players yet.*";

  const embed = createBaseEmbed()
    .setColor(VY_COLORS.gold)
    .setTitle(`🏆 GLOBAL POINTS LEADERBOARD`)
    .setDescription(
      `${region ? `Region: **${region}**\n\n` : ""}${lines}\n\n` +
      `🔗 [View Live Web Standings](${config.WEBSITE_URL}/leaderboard)`
    );

  return interaction.editReply({ embeds: [embed] });
}

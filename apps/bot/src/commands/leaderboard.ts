import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import {
  KITS,
  Kit,
  KIT_MAP,
  REGIONS,
  Region,
  REGION_MAP,
  compareTiers,
  Tier,
} from "@vyntric/shared";
import { createBaseEmbed, VY_BRAND, VY_COLORS } from "../embeds/brand.js";
import { config } from "../config.js";

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
    // Kit-specific leaderboard with proper tier-priority sorting
    const rawTiers = await prisma.playerTier.findMany({
      where: {
        kit,
        ...(region ? { player: { region } } : {}),
      },
      include: { player: true },
    });

    // Sort using official compareTiers (HT1 < LT1 < HT2 etc.)
    const sortedTiers = rawTiers
      .sort((a, b) => {
        const tierCmp = compareTiers(a.tier as Tier, b.tier as Tier);
        if (tierCmp !== 0) return tierCmp;
        // If current tiers equal, compare peak tiers
        const peakCmp = compareTiers(a.peakTier as Tier, b.peakTier as Tier);
        if (peakCmp !== 0) return peakCmp;
        // If peak tiers equal, sort by total points
        return b.player.points - a.player.points;
      })
      .slice(0, 10);

    const lines =
      sortedTiers.length > 0
        ? sortedTiers
            .map((t, index) => {
              const rFlag = REGION_MAP[t.player.region as Region]?.flag || "";
              const medal =
                index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**#${index + 1}**`;
              const peakText = t.peakTier !== t.tier ? ` *(Peak: ${t.peakTier})*` : "";
              return `${medal} \`${t.player.ign}\` ${rFlag} — **\`${t.tier}\`**${peakText}`;
            })
            .join("\n")
        : "*No ranked players found for this ladder filter.*";

    const embed = createBaseEmbed()
      .setColor(VY_COLORS.cyan)
      .setAuthor({
        name: "VYNTRIC TIERS • OFFICIAL STANDINGS",
        iconURL: VY_BRAND.swordIcon,
      })
      .setTitle(`🏆 ${KIT_MAP[kit].name.toUpperCase()} LADDER LEADERBOARD`)
      .setDescription(
        `${region ? `Region: **${region}**\n\n` : ""}${lines}\n\n` +
        `🔗 [View Live Web Standings](${config.WEBSITE_URL}/tierlist?ladder=${kit.toLowerCase()})`
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
            const medal =
              index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**#${index + 1}**`;
            return `${medal} \`${p.ign}\` ${rFlag} — **${p.points} pts**`;
          })
          .join("\n")
      : "*No registered players yet.*";

  const embed = createBaseEmbed()
    .setColor(VY_COLORS.gold)
    .setAuthor({
      name: "VYNTRIC TIERS • OFFICIAL STANDINGS",
      iconURL: VY_BRAND.swordIcon,
    })
    .setTitle(`🏆 GLOBAL COMBAT POINTS LEADERBOARD`)
    .setDescription(
      `${region ? `Region: **${region}**\n\n` : ""}${lines}\n\n` +
      `🔗 [View Live Web Standings](${config.WEBSITE_URL}/leaderboard)`
    );

  return interaction.editReply({ embeds: [embed] });
}

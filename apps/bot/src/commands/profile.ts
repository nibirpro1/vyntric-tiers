import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { KIT_MAP, Kit, REGION_MAP, Region, getTitle } from "@vyntric/shared";
import { config } from "../config.js";
import {
  createBaseEmbed,
  createErrorEmbed,
  createPlayerHeadUrl,
  createPlayerSkinUrl,
  VY_BRAND,
  VY_COLORS,
} from "../embeds/brand.js";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("View comprehensive PvP tier rankings and test record for a player")
  .addStringOption((option) =>
    option
      .setName("ign")
      .setDescription("Minecraft in-game name (leave blank to view your own)")
      .setRequired(false)
  )
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("Discord user (leave blank to view your own)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const targetIgn = interaction.options.getString("ign")?.trim();
  const targetUser = interaction.options.getUser("user");

  let player = null;

  const includePayload = {
    tiers: true,
    tests: {
      take: 3,
      orderBy: { createdAt: "desc" as const },
      include: { tester: true },
    },
  };

  if (targetIgn) {
    player = await prisma.player.findUnique({
      where: { ign: targetIgn },
      include: includePayload,
    });
  } else if (targetUser) {
    player = await prisma.player.findUnique({
      where: { discordId: targetUser.id },
      include: includePayload,
    });
  } else {
    player = await prisma.player.findUnique({
      where: { discordId: interaction.user.id },
      include: includePayload,
    });
  }

  if (!player) {
    return interaction.editReply({
      embeds: [
        createErrorEmbed(
          "Player Not Found",
          "Could not find a registered Vyntric player matching that query. Make sure the user has run `/register`."
        ),
      ],
    });
  }

  // Calculate global rank
  const higherCount = await prisma.player.count({
    where: { points: { gt: player.points } },
  });
  const rank = higherCount + 1;
  const title = getTitle(player.points);
  const regionMeta = REGION_MAP[player.region as Region];

  // Tiers list
  const tierLines =
    player.tiers.length > 0
      ? player.tiers
          .map((t) => {
            const kitMeta = KIT_MAP[t.kit as Kit];
            const peakText = t.peakTier !== t.tier ? ` *(Peak: ${t.peakTier})*` : "";
            return `${kitMeta ? kitMeta.emoji : "⚔️"} **${kitMeta ? kitMeta.name : t.kit}:** \`${t.tier}\`${peakText}`;
          })
          .join("\n")
      : "*No verified ladder placements yet.*";

  // Recent tests list
  const recentTestsLines =
    player.tests.length > 0
      ? player.tests
          .map((test) => {
            const kitMeta = KIT_MAP[test.kit as Kit];
            const resultEmoji =
              test.result === "PROMOTED"
                ? "🔺"
                : test.result === "DEMOTED"
                ? "🔻"
                : test.result === "RETAINED"
                ? "⚖️"
                : "🌟";
            const dateStr = new Date(test.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return `• ${kitMeta ? kitMeta.emoji : ""} **${test.newTier}** (\`${test.score}\`) ${resultEmoji} vs **${test.tester.ign}** • *${dateStr}*`;
          })
          .join("\n")
      : "*No recorded duel tests yet.*";

  const embed = createBaseEmbed()
    .setColor(title.color ? parseInt(title.color.replace("#", ""), 16) : VY_COLORS.primary)
    .setAuthor({
      name: `${player.ign.toUpperCase()} • COMPETITIVE DOSSIER`,
      iconURL: VY_BRAND.swordIcon,
      url: `${config.WEBSITE_URL}/player/${player.ign}`,
    })
    .setTitle(`${player.ign} — Profile Overview`)
    .setThumbnail(createPlayerHeadUrl(player.uuid || player.ign))
    .setDescription(
      `**Region:** ${regionMeta?.flag || ""} ${regionMeta?.name || player.region}\n` +
      `**Title:** \`${title.name}\` (${player.points} pts)\n` +
      `**Global Rank:** **#${rank}**\n` +
      `**Discord:** <@${player.discordId}>\n\n` +
      `### Verified Ladders\n` +
      `${tierLines}\n\n` +
      `### Recent Verified Tests\n` +
      `${recentTestsLines}\n\n` +
      `🔗 [View Interactive Web Dossier](${config.WEBSITE_URL}/player/${player.ign})`
    )
    .setFooter({
      text: `${VY_BRAND.footerText} • Rank #${rank}`,
      iconURL: VY_BRAND.logoIcon,
    });

  return interaction.editReply({ embeds: [embed] });
}

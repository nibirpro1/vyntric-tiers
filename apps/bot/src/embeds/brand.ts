import { EmbedBuilder } from "discord.js";
import { Tier, Kit, Region, TIER_COLORS, KIT_MAP, REGION_MAP } from "@vyntric/shared";

export const VY_COLORS = {
  primary: 0x7c3aed,
  cyan: 0x22d3ee,
  hotPink: 0xff2d55,
  gold: 0xffb020,
  green: 0x22c55e,
  error: 0xef4444,
  neutral: 0x64748b,
};

export function createBaseEmbed(title?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(VY_COLORS.primary)
    .setFooter({
      text: "Vyntric Tiers • Ranked. Tested. Verified.",
      iconURL: "https://mc-heads.net/head/MHF_Chest/64",
    })
    .setTimestamp();

  if (title) {
    embed.setTitle(title);
  }

  return embed;
}

export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(`✨ ${title}`)
    .setColor(VY_COLORS.cyan)
    .setDescription(description);
}

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(`❌ ${title}`)
    .setColor(VY_COLORS.error)
    .setDescription(description);
}

export function createPlayerHeadUrl(identifier: string): string {
  return `https://mc-heads.net/avatar/${identifier}/100`;
}

export function createPlayerSkinUrl(identifier: string): string {
  return `https://mc-heads.net/body/${identifier}/right`;
}

export function createResultEmbed(params: {
  ign: string;
  uuid?: string | null;
  kit: Kit;
  previousTier: Tier | null;
  newTier: Tier;
  score: string;
  testerName: string;
  notes?: string | null;
  totalPoints: number;
  globalRank: number;
  result: "PROMOTED" | "DEMOTED" | "RETAINED" | "NEW";
  profileUrl: string;
}): EmbedBuilder {
  const kitMeta = KIT_MAP[params.kit];
  const isHigh = params.newTier.startsWith("HT");
  const color = isHigh ? VY_COLORS.hotPink : VY_COLORS.cyan;

  const resultEmoji =
    params.result === "PROMOTED"
      ? "🚀 PROMOTED"
      : params.result === "DEMOTED"
      ? "🔻 DEMOTED"
      : params.result === "RETAINED"
      ? "⚖️ RETAINED"
      : "🌟 NEW PLACEMENT";

  const prevText = params.previousTier ? `\`${params.previousTier}\`` : "`Unranked`";
  const newText = `**\`${params.newTier}\`**`;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: "VYNTRIC TIERS • OFFICIAL TEST RESULT",
      iconURL: "https://mc-heads.net/head/MHF_Sword/64",
    })
    .setTitle(`${kitMeta.name} Duel: ${params.ign}`)
    .setThumbnail(createPlayerHeadUrl(params.uuid || params.ign))
    .setDescription(
      `### Result: ${resultEmoji}\n\n` +
      `**Ladder:** ${kitMeta.emoji} ${kitMeta.name}\n` +
      `**Movement:** ${prevText} ➔ ${newText}\n` +
      `**Score:** \`${params.score}\`\n` +
      `**Conducted by:** **${params.testerName}**\n\n` +
      (params.notes ? `> *"${params.notes}"*\n\n` : "") +
      `📊 **Total Standings:** **${params.totalPoints} pts** • Global Rank: **#${params.globalRank}**\n` +
      `🔗 [View Live Web Profile](${params.profileUrl})`
    )
    .setFooter({
      text: "Vyntric Tiers • Ranked. Tested. Verified.",
      iconURL: "https://mc-heads.net/head/MHF_Chest/64",
    })
    .setTimestamp();

  return embed;
}

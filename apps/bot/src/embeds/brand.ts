import { EmbedBuilder } from "discord.js";
import { Tier, Kit, Region, TIER_COLORS, KIT_MAP, REGION_MAP } from "@vyntric/shared";
import { config } from "../config.js";

export const VY_COLORS = {
  primary: 0x7c3aed, // Vyntric Purple
  cyan: 0x22d3ee,    // Cyan accent
  hotPink: 0xff2d55, // High Tier Crimson
  gold: 0xffb020,    // Grandmaster Gold
  green: 0x22c55e,   // Online / Verified Green
  error: 0xef4444,   // Red / Alert
  warning: 0xf59e0b, // Amber / Warning
  neutral: 0x64748b, // Slate Grey
};

export const VY_BRAND = {
  name: "Vyntric Tiers",
  tagline: "Ranked. Tested. Verified.",
  footerText: "Vyntric Tiers • Ranked. Tested. Verified.",
  logoIcon: "https://mc-heads.net/head/MHF_Chest/64",
  swordIcon: "https://mc-heads.net/head/MHF_Sword/64",
  websiteUrl: config.WEBSITE_URL || "https://vyntric.gg",
};

export function createBaseEmbed(title?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(VY_COLORS.primary)
    .setFooter({
      text: VY_BRAND.footerText,
      iconURL: VY_BRAND.logoIcon,
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

export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(`⚠️ ${title}`)
    .setColor(VY_COLORS.warning)
    .setDescription(description);
}

export function createInfoEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(`ℹ️ ${title}`)
    .setColor(VY_COLORS.primary)
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
      iconURL: VY_BRAND.swordIcon,
      url: params.profileUrl,
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
      `🔗 [View Live Web Dossier](${params.profileUrl})`
    )
    .setFooter({
      text: VY_BRAND.footerText,
      iconURL: VY_BRAND.logoIcon,
    })
    .setTimestamp();

  return embed;
}

export function createTranscriptEmbed(params: {
  channelName: string;
  testerName: string;
  playerIgn: string;
  kit: Kit;
  outcome: string;
  messageCount: number;
}): EmbedBuilder {
  const kitMeta = KIT_MAP[params.kit];
  return createBaseEmbed(`📜 Duel Ticket Transcript: #${params.channelName}`)
    .setColor(VY_COLORS.neutral)
    .setAuthor({
      name: "VYNTRIC TIERS • TRANSCRIPT ARCHIVE",
      iconURL: VY_BRAND.logoIcon,
    })
    .setDescription(
      `**Ladder:** ${kitMeta ? `${kitMeta.emoji} ${kitMeta.name}` : params.kit}\n` +
      `**Challenger:** \`${params.playerIgn}\`\n` +
      `**Tester:** **${params.testerName}**\n` +
      `**Status / Outcome:** **${params.outcome}**\n` +
      `**Archived Messages:** \`${params.messageCount}\`\n\n` +
      `*A complete record of this duel session has been permanently logged.*`
    );
}

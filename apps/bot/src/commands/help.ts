import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { createBaseEmbed, VY_BRAND, VY_COLORS } from "../embeds/brand.js";
import { config } from "../config.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Comprehensive guide to Vyntric Tiers commands, rules, and testing protocol");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const embed = createBaseEmbed("⚔️ VYNTRIC TIERS — SYSTEM MANUAL")
    .setColor(VY_COLORS.primary)
    .setDescription(
      `Welcome to **${VY_BRAND.name}** (*${VY_BRAND.tagline}*).\n` +
      `The competitive 1v1 tier testing platform powering rankings across 9 distinct Minecraft PvP ladders.\n\n` +
      `### 🎮 Player Commands\n` +
      `• \`/register <ign> <region>\` — Link your Minecraft account via official Mojang API.\n` +
      `• \`/profile [ign|@user]\` — View complete tier card, ladder placements, title, and global rank.\n` +
      `• \`/leaderboard [kit] [region]\` — View top combatants across global points or specific kits.\n` +
      `• \`/queue status\` — Check active waitlists and tester availability across all ladders.\n` +
      `• \`/cooldown [ign]\` — Check active re-test cooldown timers.\n` +
      `• \`/testers\` — Meet the certified Vyntric Testing Council and their specialties.\n\n` +
      `### 🛡️ Tester Commands\n` +
      `• \`/tester online|offline\` — Toggle your active tester status.\n` +
      `• \`/next <kit>\` — Claim the next waiting challenger and open a private duel ticket.\n` +
      `• \`/result <tier> <score> [notes]\` — Ratify duel outcome inside the ticket channel.\n\n` +
      `### ⚙️ Staff / Admin Commands\n` +
      `• \`/queue refresh\` — Re-render all 9 persistent queue panels in <#${config.QUEUE_CHANNEL_ID || "queue"}>.\n` +
      `• \`/queue clear <kit>\` — Clear waiting players from a ladder queue.\n` +
      `• \`/admin settier <ign> <kit> <tier>\` — Manually override or assign a player's tier.\n` +
      `• \`/admin removetier <ign> <kit>\` — Remove a player's placement in a ladder.\n` +
      `• \`/admin ban-tests <ign> <reason>\` — Suspend a player from participating in tests.\n` +
      `• \`/admin unban-tests <ign>\` — Lift a player's testing suspension.\n` +
      `• \`/admin resetcooldown <ign> <kit>\` — Reset an active re-test cooldown.\n` +
      `• \`/admin addtester <user> <ign> <role> [specialties]\` — Register a new certified tester.\n` +
      `• \`/admin removetester <user>\` — Remove tester credentials.\n` +
      `• \`/admin stats\` — View platform-wide database and queue analytics.\n\n` +
      `### 📋 Duel Rules & Cooldown Policy\n` +
      `• **Format:** First-to-5 Duels (FT5).\n` +
      `• **Promotions:** 14-day ladder cooldown.\n` +
      `• **Retentions / Placements:** 7-day ladder cooldown.\n` +
      `• **Demotions:** 3-day ladder cooldown.\n\n` +
      `🌐 **Web Platform:** [${config.WEBSITE_URL}](${config.WEBSITE_URL})`
    )
    .setFooter({
      text: `${VY_BRAND.footerText} • Type /help anytime`,
      iconURL: VY_BRAND.logoIcon,
    });

  return interaction.editReply({ embeds: [embed] });
}

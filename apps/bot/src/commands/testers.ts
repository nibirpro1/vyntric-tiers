import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { KIT_MAP, Kit, ROLE_MAP, StaffRole } from "@vyntric/shared";
import { createBaseEmbed, VY_COLORS } from "../embeds/brand";
import { config } from "../config";

export const data = new SlashCommandBuilder()
  .setName("testers")
  .setDescription("View the official Vyntric Testing Council roster");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const testers = await prisma.tester.findMany({
    orderBy: { testsCompleted: "desc" },
  });

  if (testers.length === 0) {
    return interaction.editReply({
      embeds: [createBaseEmbed("Testing Council").setDescription("No testers currently registered.")],
    });
  }

  const lines = testers.map((t) => {
    const roleMeta = ROLE_MAP[t.role as StaffRole];
    const statusEmoji = t.status === "ONLINE" ? "🟢" : t.status === "TESTING" ? "⚔️" : "⚪";
    const specs =
      t.specialties.length > 0
        ? t.specialties.map((k) => KIT_MAP[k as Kit]?.emoji || k).join(" ")
        : "All Ladders";

    return (
      `${statusEmoji} **${t.name}** (\`${t.ign}\`) — *${roleMeta?.label || t.role}*\n` +
      `> Specialties: ${specs} • Tests: **${t.testsCompleted}**\n`
    );
  }).join("\n");

  const embed = createBaseEmbed("🛡️ VYNTRIC TESTING COUNCIL")
    .setColor(VY_COLORS.primary)
    .setDescription(
      `Official certified testers responsible for conducting first-to-5 tier tests.\n\n` +
      `${lines}\n` +
      `🔗 [Meet the Full Team on Web](${config.WEBSITE_URL}/staff)`
    );

  return interaction.editReply({ embeds: [embed] });
}

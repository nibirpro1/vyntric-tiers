import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { KITS, Kit, KIT_MAP } from "@vyntric/shared";
import { createErrorEmbed, createSuccessEmbed } from "../embeds/brand.js";
import { TestService } from "../services/testService.js";
import { QueueService } from "../services/queueService.js";

export const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("Claim the next player in line for a kit test and create their ticket")
  .addStringOption((option) =>
    option
      .setName("kit")
      .setDescription("The gamemode ladder to test")
      .setRequired(true)
      .addChoices(
        KITS.map((k) => ({
          name: `${k.emoji} ${k.name}`,
          value: k.id,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const kit = interaction.options.getString("kit", true) as Kit;
  const member = await interaction.guild.members.fetch(interaction.user.id);

  const result = await TestService.pickNextPlayer(interaction.guild, member, kit);

  if (!result.success) {
    return interaction.editReply({
      embeds: [createErrorEmbed("Could Not Pick Up Player", result.message)],
    });
  }

  await QueueService.setupOrRefreshPanels(interaction.client, kit);

  return interaction.editReply({
    embeds: [createSuccessEmbed("Testing Ticket Created", result.message)],
  });
}

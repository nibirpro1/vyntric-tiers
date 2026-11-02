import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { TIER_ORDER, Tier, Kit } from "@vyntric/shared";
import { createErrorEmbed } from "../embeds/brand";
import { TestService } from "../services/testService";
import { QueueService } from "../services/queueService";

export const data = new SlashCommandBuilder()
  .setName("result")
  .setDescription("Submit final test result and assign player tier placement")
  .addStringOption((option) =>
    option
      .setName("tier")
      .setDescription("The awarded tier rank")
      .setRequired(true)
      .addChoices(
        TIER_ORDER.map((t) => ({
          name: t,
          value: t,
        }))
      )
  )
  .addStringOption((option) =>
    option
      .setName("score")
      .setDescription("Final duel score (e.g. 5-3, 5-1, 5-0)")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("notes")
      .setDescription("Constructive feedback or duel highlights")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !(interaction.channel instanceof TextChannel)) {
    return interaction.reply({
      content: "This command can only be run in a text channel.",
      ephemeral: true,
    });
  }

  // Check channel topic for kit
  const topic = interaction.channel.topic || "";
  const kitMatch = topic.match(/Kit:\s*([^\s|]+)/i);

  if (!kitMatch) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          "Not a Test Ticket",
          "The `/result` command can only be executed inside an active Vyntric test ticket channel."
        ),
      ],
      ephemeral: true,
    });
  }

  const kit = kitMatch[1] as Kit;
  const tier = interaction.options.getString("tier", true) as Tier;
  const score = interaction.options.getString("score", true).trim();
  const notes = interaction.options.getString("notes")?.trim();

  await interaction.deferReply();

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const result = await TestService.submitResult(
    interaction.channel,
    member,
    kit,
    tier,
    score,
    notes
  );

  if (!result.success) {
    return interaction.editReply({
      embeds: [createErrorEmbed("Submission Error", result.message)],
    });
  }

  // Refresh queue panel
  await QueueService.setupOrRefreshPanels(interaction.client);

  return interaction.editReply({ content: `✅ **Result logged:** ${result.message}` });
}

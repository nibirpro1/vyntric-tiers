import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { TIER_ORDER, Tier, Kit } from "@vyntric/shared";
import { createErrorEmbed } from "../embeds/brand.js";
import { TestService } from "../services/testService.js";
import { QueueService } from "../services/queueService.js";

export const data = new SlashCommandBuilder()
  .setName("close")
  .setDescription("Conclude duel test, assign tier, and close the testing ticket")
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
      content: "This command can only be run in an active ticket channel.",
      ephemeral: true,
    });
  }

  const topic = interaction.channel.topic || "";
  const kitMatch = topic.match(/Kit:\s*([^\s|]+)/i);

  if (!kitMatch) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          "Not a Test Ticket",
          "The `/close` command can only be executed inside an active Vyntric test ticket channel."
        ),
      ],
      ephemeral: true,
    });
  }

  const kit = kitMatch[1] as Kit;
  const tier = interaction.options.getString("tier", true) as Tier;
  const score = interaction.options.getString("score", true).trim();
  const notes = interaction.options.getString("notes")?.trim() || "Official evaluation duel completed.";

  const member = await interaction.guild.members.fetch(interaction.user.id);

  await interaction.deferReply();

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
      embeds: [createErrorEmbed("Failed to Conclude Test", result.message)],
    });
  }

  await QueueService.setupOrRefreshPanels(interaction.client, kit);
  return interaction.editReply({ content: `✅ **Result logged:** ${result.message}` });
}

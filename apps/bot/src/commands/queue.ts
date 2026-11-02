import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import { KITS, Kit, KIT_MAP } from "@vyntric/shared";
import { createBaseEmbed, createSuccessEmbed, VY_COLORS } from "../embeds/brand";
import { QueueService } from "../services/queueService";

export const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("View or manage testing queues")
  .addSubcommand((sub) =>
    sub.setName("status").setDescription("Check current waiting line and active tests for all ladders")
  )
  .addSubcommand((sub) =>
    sub
      .setName("refresh")
      .setDescription("Re-post or refresh all 9 persistent queue panels in the queue channel (Staff)")
  )
  .addSubcommand((sub) =>
    sub
      .setName("clear")
      .setDescription("Clear waiting players from a ladder queue (Admin)")
      .addStringOption((opt) =>
        opt
          .setName("kit")
          .setDescription("Gamemode ladder to clear")
          .setRequired(true)
          .addChoices(
            KITS.map((k) => ({
              name: `${k.emoji} ${k.name}`,
              value: k.id,
            }))
          )
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "status") {
    await interaction.deferReply();

    const counts = await prisma.queueEntry.groupBy({
      by: ["kit"],
      where: { status: "WAITING" },
      _count: true,
    });

    const countMap = new Map(counts.map((c) => [c.kit, c._count]));

    const lines = KITS.map((k) => {
      const count = countMap.get(k.id) || 0;
      return `${k.emoji} **${k.name}:** \`${count}\` waiting`;
    }).join("\n");

    const embed = createBaseEmbed()
      .setColor(VY_COLORS.primary)
      .setTitle("📊 VYNTRIC LADDER QUEUE OVERVIEW")
      .setDescription(lines);

    return interaction.editReply({ embeds: [embed] });
  }

  if (sub === "refresh") {
    await interaction.deferReply({ ephemeral: true });
    await QueueService.setupOrRefreshPanels(interaction.client);
    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Panels Refreshed",
          "All 9 kit queue panels in the queue channel have been refreshed with the latest data."
        ),
      ],
    });
  }

  if (sub === "clear") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ You need Administrator permissions to clear queues.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const kit = interaction.options.getString("kit", true) as Kit;

    await prisma.queueEntry.updateMany({
      where: { kit, status: "WAITING" },
      data: { status: "CANCELLED" },
    });

    await QueueService.setupOrRefreshPanels(interaction.client);

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Queue Cleared",
          `All waiting players have been cleared from the **${KIT_MAP[kit].name}** queue.`
        ),
      ],
    });
  }
}

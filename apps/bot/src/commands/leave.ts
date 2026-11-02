import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { QueueService, memoryQueues, MemoryQueueEntry } from "../services/queueService.js";
import { createSuccessEmbed, createWarningEmbed } from "../embeds/brand.js";
import { isDbConfigured } from "../services/mcVerifyServer.js";
import { prisma } from "@vyntric/db";
import { KIT_MAP, Kit } from "@vyntric/shared";

export const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leave the evaluation testing waitlist or queue");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  let removedAny = false;
  const leftKits: string[] = [];

  // 1. Remove from in-memory queues
  for (const [kit, entries] of Array.from(memoryQueues.entries())) {
    const idx = entries.findIndex((e: MemoryQueueEntry) => e.discordId === userId);
    if (idx !== -1) {
      entries.splice(idx, 1);
      removedAny = true;
      leftKits.push(KIT_MAP[kit as Kit]?.name || kit);
    }
  }

  // 2. Remove from DB if configured
  if (isDbConfigured()) {
    try {
      const player = await prisma.player.findUnique({
        where: { discordId: userId },
      });
      if (player) {
        const res = await prisma.queueEntry.updateMany({
          where: { playerId: player.id, status: "WAITING" },
          data: { status: "CANCELLED" },
        });
        if (res.count > 0) removedAny = true;
      }
    } catch {
      // In-memory handled
    }
  }

  if (!removedAny) {
    return interaction.editReply({
      embeds: [
        createWarningEmbed(
          "Not in Any Queue",
          "You are not currently in any testing waitlist or active queue."
        ),
      ],
    });
  }

  await QueueService.setupOrRefreshPanels(interaction.client);

  return interaction.editReply({
    embeds: [
      createSuccessEmbed(
        "Left Testing Waitlist",
        `You have successfully removed yourself from the testing waitlist${leftKits.length ? ` for **${leftKits.join(", ")}**` : ""}.\n\nYou can re-enter anytime whenever you are ready to test!`
      ),
    ],
  });
}

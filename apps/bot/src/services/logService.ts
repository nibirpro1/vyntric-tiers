import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { config } from "../config";
import { createBaseEmbed, VY_COLORS } from "../embeds/brand";

export class LogService {
  public static async logAction(
    client: Client,
    title: string,
    description: string,
    color: number = VY_COLORS.primary,
    fields?: { name: string; value: string; inline?: boolean }[]
  ): Promise<void> {
    if (!config.STAFF_LOGS_CHANNEL_ID) return;

    try {
      const channel = await client.channels.fetch(config.STAFF_LOGS_CHANNEL_ID).catch(() => null);
      if (!channel || !(channel instanceof TextChannel)) return;

      const embed = createBaseEmbed(`🛡️ [STAFF AUDIT] ${title}`)
        .setColor(color)
        .setDescription(description);

      if (fields) {
        embed.addFields(fields);
      }

      await channel.send({ embeds: [embed] }).catch(() => null);
    } catch (err) {
      console.warn("Failed to send staff log:", err);
    }
  }
}

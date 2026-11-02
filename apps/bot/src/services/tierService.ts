import { Guild, GuildMember } from "discord.js";
import { Tier, Kit, KIT_MAP, TIER_COLORS, getTitle } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";

export class TierService {
  /**
   * Synchronizes Discord roles for a player's new tier placement.
   */
  public static async syncPlayerTierRole(
    guild: Guild,
    member: GuildMember,
    kit: Kit,
    newTier: Tier,
    previousTier?: Tier | null
  ): Promise<void> {
    try {
      const kitMeta = KIT_MAP[kit];
      const newRoleName = `${kitMeta.name} ${newTier}`;

      // Remove previous tier role if exists
      if (previousTier) {
        const prevRoleName = `${kitMeta.name} ${previousTier}`;
        const prevRole = guild.roles.cache.find(
          (r) => r.name.toLowerCase() === prevRoleName.toLowerCase()
        );
        if (prevRole && member.roles.cache.has(prevRole.id)) {
          await member.roles.remove(prevRole).catch(() => null);
        }
      }

      // Add new tier role
      let newRole = guild.roles.cache.find(
        (r) => r.name.toLowerCase() === newRoleName.toLowerCase()
      );

      // Create role if it doesn't exist yet and bot has permission
      if (!newRole && guild.members.me?.permissions.has("ManageRoles")) {
        try {
          const colorHex = TIER_COLORS[newTier] || "#7C3AED";
          newRole = await guild.roles.create({
            name: newRoleName,
            color: parseInt(colorHex.replace("#", ""), 16),
            reason: `Vyntric auto-created tier role for ${newRoleName}`,
          });
        } catch {
          // Ignore role creation failure
        }
      }

      if (newRole && !member.roles.cache.has(newRole.id)) {
        await member.roles.add(newRole).catch(() => null);
      }
    } catch (err) {
      console.warn("Failed to sync Discord tier roles:", err);
    }
  }

  /**
   * Sync title role based on accumulated points (e.g., Grandmaster).
   */
  public static async syncTitleRole(guild: Guild, member: GuildMember, points: number): Promise<void> {
    try {
      const title = getTitle(points);
      const titleRole = guild.roles.cache.find(
        (r) => r.name.toLowerCase() === title.name.toLowerCase()
      );
      if (titleRole && !member.roles.cache.has(titleRole.id)) {
        await member.roles.add(titleRole).catch(() => null);
      }
    } catch (err) {
      console.warn("Failed to sync title role:", err);
    }
  }

  /**
   * Broadcasts real-time events to Supabase so the website can reactively animate cards.
   */
  public static async broadcastLiveUpdate(event: string, payload: Record<string, unknown>): Promise<void> {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) return;
    try {
      await fetch(`${config.SUPABASE_URL}/rest/v1/rpc/broadcast_tier_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${config.SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ event_type: event, payload }),
      }).catch(() => null);
    } catch {
      // Non-blocking
    }
  }
}

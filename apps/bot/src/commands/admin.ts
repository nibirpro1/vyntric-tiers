import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@vyntric/db";
import {
  KITS,
  Kit,
  KIT_MAP,
  TIER_ORDER,
  Tier,
  STAFF_ROLES,
  StaffRole,
  calculatePoints,
} from "@vyntric/shared";
import { createErrorEmbed, createSuccessEmbed } from "../embeds/brand";
import { LogService } from "../services/logService";
import { TierService } from "../services/tierService";

export const data = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Administrative commands for Vyntric Tiers management")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName("settier")
      .setDescription("Manually set a player's tier placement")
      .addStringOption((opt) => opt.setName("ign").setDescription("Player IGN").setRequired(true))
      .addStringOption((opt) =>
        opt
          .setName("kit")
          .setDescription("Gamemode ladder")
          .setRequired(true)
          .addChoices(KITS.map((k) => ({ name: k.name, value: k.id })))
      )
      .addStringOption((opt) =>
        opt
          .setName("tier")
          .setDescription("Tier to assign")
          .setRequired(true)
          .addChoices(TIER_ORDER.map((t) => ({ name: t, value: t })))
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("removetier")
      .setDescription("Remove a player's tier from a ladder")
      .addStringOption((opt) => opt.setName("ign").setDescription("Player IGN").setRequired(true))
      .addStringOption((opt) =>
        opt
          .setName("kit")
          .setDescription("Gamemode ladder")
          .setRequired(true)
          .addChoices(KITS.map((k) => ({ name: k.name, value: k.id })))
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("ban-tests")
      .setDescription("Suspend a player from queueing and participating in tier tests")
      .addStringOption((opt) => opt.setName("ign").setDescription("Player IGN").setRequired(true))
      .addStringOption((opt) => opt.setName("reason").setDescription("Reason for suspension").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub
      .setName("unban-tests")
      .setDescription("Lift a player's testing suspension")
      .addStringOption((opt) => opt.setName("ign").setDescription("Player IGN").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub
      .setName("resetcooldown")
      .setDescription("Clear active re-test cooldown for a player")
      .addStringOption((opt) => opt.setName("ign").setDescription("Player IGN").setRequired(true))
      .addStringOption((opt) =>
        opt
          .setName("kit")
          .setDescription("Gamemode ladder")
          .setRequired(true)
          .addChoices(KITS.map((k) => ({ name: k.name, value: k.id })))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ You need Administrator permissions to run this command.",
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const sub = interaction.options.getSubcommand();
  const ign = interaction.options.getString("ign", true).trim();

  const player = await prisma.player.findUnique({
    where: { ign },
    include: { tiers: true },
  });

  if (!player) {
    return interaction.editReply({
      embeds: [createErrorEmbed("Player Not Found", `Could not find player with IGN "${ign}".`)],
    });
  }

  if (sub === "settier") {
    const kit = interaction.options.getString("kit", true) as Kit;
    const tier = interaction.options.getString("tier", true) as Tier;

    await prisma.playerTier.upsert({
      where: { playerId_kit: { playerId: player.id, kit } },
      update: { tier, peakTier: tier },
      create: { playerId: player.id, kit, tier, peakTier: tier },
    });

    // Recalculate points
    const allTiers = await prisma.playerTier.findMany({ where: { playerId: player.id } });
    const tierMap: Partial<Record<Kit, Tier>> = {};
    for (const t of allTiers) {
      tierMap[t.kit as Kit] = t.tier as Tier;
    }
    const totalPoints = calculatePoints(tierMap);
    await prisma.player.update({ where: { id: player.id }, data: { points: totalPoints } });

    // Sync Discord role
    if (interaction.guild) {
      const member = await interaction.guild.members.fetch(player.discordId).catch(() => null);
      if (member) {
        await TierService.syncPlayerTierRole(interaction.guild, member, kit, tier);
        await TierService.syncTitleRole(interaction.guild, member, totalPoints);
      }
    }

    await LogService.logAction(
      interaction.client,
      "Manual Tier Override",
      `<@${interaction.user.id}> set **${player.ign}** to **${tier}** in **${KIT_MAP[kit].name}**.`
    );

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Tier Updated",
          `Successfully assigned **${tier}** to **${player.ign}** in **${KIT_MAP[kit].name}**. Total points updated to **${totalPoints}**.`
        ),
      ],
    });
  }

  if (sub === "removetier") {
    const kit = interaction.options.getString("kit", true) as Kit;

    await prisma.playerTier.deleteMany({
      where: { playerId: player.id, kit },
    });

    // Recalculate points
    const allTiers = await prisma.playerTier.findMany({ where: { playerId: player.id } });
    const tierMap: Partial<Record<Kit, Tier>> = {};
    for (const t of allTiers) {
      tierMap[t.kit as Kit] = t.tier as Tier;
    }
    const totalPoints = calculatePoints(tierMap);
    await prisma.player.update({ where: { id: player.id }, data: { points: totalPoints } });

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Tier Removed",
          `Removed **${KIT_MAP[kit].name}** tier from **${player.ign}**. Total points now: **${totalPoints}**.`
        ),
      ],
    });
  }

  if (sub === "ban-tests") {
    const reason = interaction.options.getString("reason", true);
    await prisma.player.update({ where: { id: player.id }, data: { banned: true } });

    await LogService.logAction(
      interaction.client,
      "Testing Suspension",
      `<@${interaction.user.id}> suspended **${player.ign}** from tier testing.\n**Reason:** ${reason}`
    );

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Player Suspended",
          `**${player.ign}** has been banned from joining queues and participating in tests.`
        ),
      ],
    });
  }

  if (sub === "unban-tests") {
    await prisma.player.update({ where: { id: player.id }, data: { banned: false } });

    await LogService.logAction(
      interaction.client,
      "Suspension Lifted",
      `<@${interaction.user.id}> lifted testing suspension for **${player.ign}**.`
    );

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Suspension Lifted",
          `**${player.ign}** is now unbanned and may join testing queues.`
        ),
      ],
    });
  }

  if (sub === "resetcooldown") {
    const kit = interaction.options.getString("kit", true) as Kit;
    await prisma.cooldown.deleteMany({
      where: { playerId: player.id, kit },
    });

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Cooldown Cleared",
          `Cleared active re-test cooldown for **${player.ign}** on **${KIT_MAP[kit].name}**.`
        ),
      ],
    });
  }
}

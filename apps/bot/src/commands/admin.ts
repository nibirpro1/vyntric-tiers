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
  ROLE_MAP,
  calculatePoints,
  compareTiers,
} from "@vyntric/shared";
import { createBaseEmbed, createErrorEmbed, createSuccessEmbed, VY_COLORS } from "../embeds/brand.js";
import { LogService } from "../services/logService.js";
import { TierService } from "../services/tierService.js";

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
  )
  .addSubcommand((sub) =>
    sub
      .setName("addtester")
      .setDescription("Register a new tester to the Vyntric Testing Council")
      .addUserOption((opt) => opt.setName("user").setDescription("Discord user").setRequired(true))
      .addStringOption((opt) => opt.setName("ign").setDescription("Minecraft IGN").setRequired(true))
      .addStringOption((opt) =>
        opt
          .setName("role")
          .setDescription("Staff rank role")
          .setRequired(true)
          .addChoices(
            STAFF_ROLES.map((r) => ({
              name: r.label,
              value: r.role,
            }))
          )
      )
      .addStringOption((opt) =>
        opt
          .setName("specialties")
          .setDescription("Comma-separated ladders (e.g. SWORD,AXE,CRYSTAL) or leave blank for all")
          .setRequired(false)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("removetester")
      .setDescription("Remove a user from the Vyntric Testing Council")
      .addUserOption((opt) => opt.setName("user").setDescription("Discord user").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("stats").setDescription("View platform system and testing statistics")
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

  // --- STATS SUBCOMMAND ---
  if (sub === "stats") {
    const [
      totalPlayers,
      totalTests,
      totalTesters,
      onlineTesters,
      activeQueues,
      recentTests,
    ] = await Promise.all([
      prisma.player.count(),
      prisma.test.count(),
      prisma.tester.count(),
      prisma.tester.count({ where: { status: { in: ["ONLINE", "TESTING"] } } }),
      prisma.queueEntry.count({ where: { status: "WAITING" } }),
      prisma.test.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const embed = createBaseEmbed("📊 VYNTRIC TIERS — SYSTEM METRICS")
      .setColor(VY_COLORS.cyan)
      .setDescription(
        `### Platform Overview\n` +
        `• **Registered Players:** \`${totalPlayers.toLocaleString()}\`\n` +
        `• **Tests Completed (All-Time):** \`${totalTests.toLocaleString()}\`\n` +
        `• **Tests in Last 24 Hours:** \`${recentTests}\`\n\n` +
        `### Operations\n` +
        `• **Testing Council Roster:** \`${totalTesters}\` (${onlineTesters} active)\n` +
        `• **Challengers in Queue:** \`${activeQueues}\`\n` +
        `• **Ladders Monitored:** \`9\`\n\n` +
        `*Real-time synchronization active with Supabase and web platform.*`
      );

    return interaction.editReply({ embeds: [embed] });
  }

  // --- ADD TESTER SUBCOMMAND ---
  if (sub === "addtester") {
    const targetUser = interaction.options.getUser("user", true);
    const ign = interaction.options.getString("ign", true).trim();
    const role = interaction.options.getString("role", true) as StaffRole;
    const rawSpecialties = interaction.options.getString("specialties");

    let specialties: Kit[] = [];
    if (rawSpecialties) {
      specialties = rawSpecialties
        .toUpperCase()
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is Kit => KITS.some((k) => k.id === s));
    }

    if (specialties.length === 0) {
      specialties = KITS.map((k) => k.id);
    }

    const tester = await prisma.tester.upsert({
      where: { discordId: targetUser.id },
      update: {
        ign,
        name: targetUser.displayName || targetUser.username,
        role,
        specialties,
      },
      create: {
        discordId: targetUser.id,
        ign,
        name: targetUser.displayName || targetUser.username,
        role,
        specialties,
        status: "OFFLINE",
      },
    });

    await LogService.logAction(
      interaction.client,
      "Tester Registered",
      `<@${interaction.user.id}> added <@${targetUser.id}> (\`${ign}\`) as **${ROLE_MAP[role]?.label || role}**.`
    );

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Tester Registered",
          `<@${targetUser.id}> (\`${ign}\`) has been added to the Vyntric Testing Council as **${ROLE_MAP[role]?.label || role}**.\n` +
          `Specialties: ${specialties.map((k) => KIT_MAP[k]?.emoji || k).join(" ")}`
        ),
      ],
    });
  }

  // --- REMOVE TESTER SUBCOMMAND ---
  if (sub === "removetester") {
    const targetUser = interaction.options.getUser("user", true);

    const existing = await prisma.tester.findUnique({
      where: { discordId: targetUser.id },
    });

    if (!existing) {
      return interaction.editReply({
        embeds: [createErrorEmbed("Not a Tester", "That user is not registered as a tester.")],
      });
    }

    await prisma.tester.delete({ where: { discordId: targetUser.id } });

    await LogService.logAction(
      interaction.client,
      "Tester Removed",
      `<@${interaction.user.id}> removed <@${targetUser.id}> (\`${existing.ign}\`) from the Testing Council.`
    );

    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "Tester Removed",
          `<@${targetUser.id}> (\`${existing.ign}\`) has been removed from the Testing Council.`
        ),
      ],
    });
  }

  // Commands requiring player IGN
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

  // --- SET TIER SUBCOMMAND ---
  if (sub === "settier") {
    const kit = interaction.options.getString("kit", true) as Kit;
    const tier = interaction.options.getString("tier", true) as Tier;

    const existingTierRecord = await prisma.playerTier.findUnique({
      where: { playerId_kit: { playerId: player.id, kit } },
    });

    // Check historical peak
    const peakTier = existingTierRecord
      ? compareTiers(tier, existingTierRecord.peakTier) < 0
        ? tier
        : existingTierRecord.peakTier
      : tier;

    await prisma.playerTier.upsert({
      where: { playerId_kit: { playerId: player.id, kit } },
      update: { tier, peakTier },
      create: { playerId: player.id, kit, tier, peakTier },
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
        await TierService.syncPlayerTierRole(interaction.guild, member, kit, tier, existingTierRecord?.tier);
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

  // --- REMOVE TIER SUBCOMMAND ---
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

  // --- BAN TESTS SUBCOMMAND ---
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

  // --- UNBAN TESTS SUBCOMMAND ---
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

  // --- RESET COOLDOWN SUBCOMMAND ---
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

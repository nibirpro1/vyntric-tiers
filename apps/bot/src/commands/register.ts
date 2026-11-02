import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { REGIONS, Region, REGION_MAP } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config";
import {
  createErrorEmbed,
  createPlayerHeadUrl,
  createSuccessEmbed,
  VY_COLORS,
} from "../embeds/brand";
import { MojangService } from "../services/mojangService";

export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Link your Minecraft account and competitive region to Vyntric Tiers")
  .addStringOption((option) =>
    option
      .setName("ign")
      .setDescription("Your exact in-game Minecraft username")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("region")
      .setDescription("Your competitive play region")
      .setRequired(true)
      .addChoices(
        REGIONS.map((r) => ({
          name: `${r.flag} ${r.name} (${r.id})`,
          value: r.id,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const rawIgn = interaction.options.getString("ign", true).trim();
  const region = interaction.options.getString("region", true) as Region;

  // 1. Validate IGN with Mojang API
  const mojangProfile = await MojangService.fetchProfile(rawIgn);
  if (!mojangProfile) {
    return interaction.editReply({
      embeds: [
        createErrorEmbed(
          "Invalid Minecraft IGN",
          `Could not verify **"${rawIgn}"** on official Mojang servers. Please check spelling and try again.`
        ),
      ],
    });
  }

  const { name: ign, id: rawUuid } = mojangProfile;
  const uuid = MojangService.formatUuid(rawUuid);

  // 2. Check if already registered by another Discord user
  const existingByDiscord = await prisma.player.findUnique({
    where: { discordId: interaction.user.id },
  });

  const existingByIgn = await prisma.player.findUnique({
    where: { ign },
  });

  if (existingByIgn && existingByIgn.discordId !== interaction.user.id) {
    return interaction.editReply({
      embeds: [
        createErrorEmbed(
          "Account Already Linked",
          `Minecraft account **${ign}** is already linked to another Discord user (<@${existingByIgn.discordId}>). If this is an error, please contact staff.`
        ),
      ],
    });
  }

  // 3. Upsert player in DB
  const player = await prisma.player.upsert({
    where: { discordId: interaction.user.id },
    update: {
      ign,
      uuid,
      region,
    },
    create: {
      discordId: interaction.user.id,
      ign,
      uuid,
      region,
      points: 0,
    },
  });

  // 4. Update Discord Nickname & Role if guild member
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member) {
    const regionFlag = REGION_MAP[region]?.flag || region;
    const newNick = `${ign} [${region}]`.slice(0, 32);
    await member.setNickname(newNick).catch(() => null);

    if (config.ROLE_REGISTERED_ID) {
      await member.roles.add(config.ROLE_REGISTERED_ID).catch(() => null);
    }
  }

  const successEmbed = createSuccessEmbed(
    "Account Linked Successfully!",
    `Welcome to **Vyntric Tiers**, **${ign}**!\n\n` +
    `**IGN:** \`${ign}\`\n` +
    `**Region:** ${REGION_MAP[region].flag} ${REGION_MAP[region].name}\n` +
    `**UUID:** \`${uuid}\`\n` +
    `**Total Points:** \`0\` (Unranked)\n\n` +
    `You can now join any active ladder queue in <#${config.QUEUE_CHANNEL_ID || "queue"}>!`
  )
    .setThumbnail(createPlayerHeadUrl(uuid || ign))
    .setColor(VY_COLORS.cyan);

  return interaction.editReply({ embeds: [successEmbed] });
}

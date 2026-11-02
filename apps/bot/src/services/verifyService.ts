import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Guild,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { REGIONS, Region, REGION_MAP } from "@vyntric/shared";
import { prisma } from "@vyntric/db";
import { config } from "../config.js";
import {
  createBaseEmbed,
  createErrorEmbed,
  createPlayerHeadUrl,
  createSuccessEmbed,
  VY_BRAND,
  VY_COLORS,
} from "../embeds/brand.js";
import { MojangService } from "./mojangService.js";
import { memoryPlayers } from "./queueService.js";
import {
  generateAuthCode,
  isDbConfigured,
  pendingVerificationsByDiscordId,
  recentVerifiedAccounts,
} from "./mcVerifyServer.js";

export class VerifyService {
  /**
   * ActionRow with MCTiers-style Verify Button on the persistent panel.
   */
  public static createVerifyButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("mctiers_verify_open")
        .setLabel("Verify Account")
        .setEmoji("⛏️")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("mctiers_verify_help")
        .setLabel("Verification Help")
        .setEmoji("❓")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  /**
   * Builds the ephemeral Direct Connect embed matching Screenshot 3.
   */
  public static createDirectConnectEmbed(discordId: string): EmbedBuilder {
    const code = generateAuthCode(discordId);
    const host = (config as any).MC_VERIFY_HOST || "verify.vyntric.gg";
    const serverAddress = `${code}.${host}`;
    const expiresTimestamp = Math.floor((Date.now() + 15 * 60 * 1000) / 1000);

    return new EmbedBuilder()
      .setColor(0x2563eb) // MCTiers Blue accent
      .setTitle("Account Verification")
      .setDescription(
        `Please link your Minecraft account to continue.\n` +
        `Direct Connect to: **\`${serverAddress}\`**\n` +
        `*(Or \`localhost:25565\` if connecting locally)*\n\n` +
        `When done, return here and click **"Enter Waitlist"**.\n\n` +
        `**Auth Code Expiration:** <t:${expiresTimestamp}:R>\n\n` +
        `\`\`\`txt\n` +
        `Server Address\n` +
        `[ ${serverAddress} ]\n` +
        `\`\`\``
      )
      .setFooter({
        text: `Vyntric Tiers • Minecraft In-Game Verification`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Action buttons for the ephemeral Direct Connect message.
   */
  public static createDirectConnectButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_check_status")
        .setLabel("I Have Connected in Minecraft")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("verify_instant_modal")
        .setLabel("Instant Verify (Cracked / No MC)")
        .setEmoji("⚡")
        .setStyle(ButtonStyle.Primary)
    );
  }

  /**
   * Builds the interactive verification panel embed for #verify channel.
   */
  public static buildVerifyEmbed(): ReturnType<typeof createBaseEmbed> {
    return createBaseEmbed()
      .setColor(VY_COLORS.cyan)
      .setTitle("⛏️ LINK YOUR MINECRAFT ACCOUNT")
      .setThumbnail("https://assets.mcasset.cloud/1.20.4/assets/minecraft/textures/item/diamond_sword.png")
      .setDescription(
        `Welcome to **Vyntric Tiers** (*Ranked. Tested. Verified.*)!\n\n` +
        `To gain access to competitive testing ladders, join queues, and participate in duels, you must link your Minecraft Java account.\n\n` +
        `### 📋 How to Verify:\n` +
        `1. Click the **[Verify Account]** button below.\n` +
        `2. Follow the Direct Connect instructions in Minecraft Multiplayer, or choose **Instant Verify**.\n` +
        `3. In Minecraft, you will see the disconnect screen: \`Account Verified ({IGN})\`.\n` +
        `4. Return to Discord and click **[Enter Waitlist]** to begin!\n\n` +
        `### 🛡️ What Happens Automatically:\n` +
        `• Your server nickname will be set to \`{IGN} [{Region}]\`.\n` +
        `• You will receive the **Registered** role, unlocking **#pick-gamemodes** to choose your ladders!`
      )
      .setFooter({
        text: `${VY_BRAND.footerText} • Click button below to link`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Posts or updates the verification card in #verify channel.
   */
  public static async setupVerificationPanel(channel: TextChannel): Promise<void> {
    try {
      const embed = this.buildVerifyEmbed();
      const row = this.createVerifyButton();

      const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
      let existingMessage = null;

      if (messages) {
        existingMessage = messages.find(
          (m) =>
            m.author.id === channel.client.user?.id &&
            m.embeds[0]?.title?.includes("LINK YOUR MINECRAFT ACCOUNT")
        );
      }

      if (existingMessage) {
        await existingMessage.edit({ embeds: [embed], components: [row] }).catch(() => null);
      } else {
        await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
      }
    } catch (err) {
      console.warn("Failed to post verification panel:", err);
    }
  }

  /**
   * Builds the pop-up modal when a user chooses Instant / Cracked verification.
   */
  public static createVerifyModal(): ModalBuilder {
    const modal = new ModalBuilder()
      .setCustomId("mctiers_verify_modal")
      .setTitle("Link Minecraft Account");

    const ignInput = new TextInputBuilder()
      .setCustomId("verify_ign")
      .setLabel("Minecraft Username (IGN) *")
      .setPlaceholder("e.g. Kazuma (exact spelling)")
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(16)
      .setRequired(true);

    const regionInput = new TextInputBuilder()
      .setCustomId("verify_region")
      .setLabel("Region (AS/AU, NA, EU, SA, ME) *")
      .setPlaceholder("e.g. AS")
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(5)
      .setRequired(true);

    const typeInput = new TextInputBuilder()
      .setCustomId("verify_account_type")
      .setLabel("Account Type (Premium or Cracked) *")
      .setPlaceholder("Type 'Premium' or 'Cracked'")
      .setValue("Premium")
      .setStyle(TextInputStyle.Short)
      .setMinLength(5)
      .setMaxLength(10)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(ignInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(regionInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(typeInput)
    );

    return modal;
  }

  /**
   * Handles modal submission, validates Mojang profile, updates Discord roles and nickname.
   */
  public static async handleVerifyModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const rawIgn = interaction.fields.getTextInputValue("verify_ign").trim();
    let rawRegion = interaction.fields.getTextInputValue("verify_region").trim().toUpperCase();
    const accountType = interaction.fields.getTextInputValue("verify_account_type").trim().toLowerCase();
    const isCracked = accountType.includes("crack");

    // Validate region fallback
    if (rawRegion === "AS/AU" || rawRegion === "AU") rawRegion = "AS";
    const validRegions = ["NA", "EU", "AS", "AU", "SA", "ME", "AF"];
    if (!validRegions.includes(rawRegion)) {
      rawRegion = "AS";
    }
    const region = rawRegion as Region;

    let ign = rawIgn;
    let uuid = rawIgn;

    // 1. Validate IGN with Mojang API if Premium
    if (!isCracked) {
      const mojangProfile = await MojangService.fetchProfile(rawIgn);
      if (!mojangProfile) {
        await interaction.editReply({
          embeds: [
            createErrorEmbed(
              "Minecraft Account Not Found",
              `Could not verify **"${rawIgn}"** on official Mojang servers.\n\n` +
              `• If you use a **Premium (Official Mojang)** account, please check exact spelling.\n` +
              `• If you use a **Cracked / Offline** account, re-open the form and type **Cracked** in the Account Type box!`
            ),
          ],
        });
        return;
      }
      ign = mojangProfile.name;
      uuid = MojangService.formatUuid(mojangProfile.id);
    }

    // 2. Safe Database Persistence (Non-blocking if DB is not connected)
    memoryPlayers.set(interaction.user.id, {
      id: uuid || ign,
      discordId: interaction.user.id,
      ign,
      uuid: uuid || ign,
      region,
    });

    if (isDbConfigured()) {
      try {
        await prisma.player.upsert({
          where: { discordId: interaction.user.id },
          update: { ign, uuid, region },
          create: {
            discordId: interaction.user.id,
            ign,
            uuid,
            region,
            points: 0,
          },
        });
      } catch {
        // Fallback gracefully
      }
    }

    // 3. Update Discord Nickname & Role
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (member) {
      const newNick = `${ign} [${region}]`.slice(0, 32);
      await member.setNickname(newNick).catch(() => null);

      if (config.ROLE_REGISTERED_ID) {
        await member.roles.add(config.ROLE_REGISTERED_ID).catch(() => null);
      }
    }

    const pickerChannel = interaction.guild?.channels.cache.find((c) => c.name === "pick-gamemodes");
    const nextStepText = pickerChannel
      ? `🎮 **Next Step:** Head over to <#${pickerChannel.id}> to select which PvP gamemodes you want visible in your sidebar!`
      : `🎮 **Next Step:** Head over to **#pick-gamemodes** to select which gamemode queues you want to participate in!`;

    const successEmbed = createSuccessEmbed(
      "Minecraft Account Linked Successfully!",
      `Welcome to **Vyntric Tiers**, **${ign}**!\n\n` +
      `**IGN:** \`${ign}\`\n` +
      `**Region:** ${REGION_MAP[region]?.flag || "🌐"} ${REGION_MAP[region]?.name || region}\n` +
      `**UUID:** \`${uuid}\`\n` +
      `**Role Granted:** <@&${config.ROLE_REGISTERED_ID}>\n\n` +
      nextStepText
    )
      .setThumbnail(createPlayerHeadUrl(uuid || ign))
      .setColor(VY_COLORS.green);

    await interaction.editReply({ embeds: [successEmbed] });
  }
}

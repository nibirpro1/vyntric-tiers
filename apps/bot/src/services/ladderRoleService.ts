import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Guild,
  GuildMember,
  Role,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { KITS, Kit, KIT_MAP } from "@vyntric/shared";
import {
  createBaseEmbed,
  createSuccessEmbed,
  VY_BRAND,
  VY_COLORS,
} from "../embeds/brand.js";

export class LadderRoleService {
  private static roleCache = new Map<Kit, string>();

  /**
   * Resolves or creates ladder roles for all 9 kits.
   */
  public static async getOrCreateLadderRoles(guild: Guild): Promise<Map<Kit, Role>> {
    const rolesMap = new Map<Kit, Role>();

    for (const kitMeta of KITS) {
      const roleName = `${kitMeta.name} Ladder`;
      let role = guild.roles.cache.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );

      if (!role) {
        const colorInt = kitMeta.accentColor
          ? parseInt(kitMeta.accentColor.replace("#", ""), 16)
          : VY_COLORS.primary;

        role = await guild.roles.create({
          name: roleName,
          color: colorInt,
          reason: `Vyntric auto-created queue unlock role for ${kitMeta.name}`,
        });
      }

      rolesMap.set(kitMeta.id, role);
      this.roleCache.set(kitMeta.id, role.id);
    }

    return rolesMap;
  }

  /**
   * Builds the interactive embed for #pick-gamemodes.
   */
  public static buildPickerEmbed(): ReturnType<typeof createBaseEmbed> {
    return createBaseEmbed()
      .setColor(VY_COLORS.primary)
      .setTitle("🎮 SELECT YOUR GAMEMODE QUEUES")
      .setDescription(
        `Choose which competitive Minecraft PvP ladders you want to see and participate in.\n` +
        `Selecting a ladder will **instantly reveal its dedicated queue channel** in your channel list.\n\n` +
        `💡 *Use the dropdown menu below to pick one, several, or all gamemodes. You can update your choices at any time!*`
      )
      .setFooter({
        text: `${VY_BRAND.footerText} • Customize your queue sidebar`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Builds the multi-select dropdown menu with full kit descriptions restored.
   */
  public static createPickerSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
    const options = KITS.map((k) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(k.name)
        .setValue(k.id)
        .setDescription(k.shortDesc.slice(0, 100))
        .setEmoji(k.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ladder_role_select")
      .setPlaceholder("Click here to select your gamemodes (Multi-select)...")
      .setMinValues(0)
      .setMaxValues(KITS.length)
      .addOptions(options);

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  }

  /**
   * Posts or refreshes the gamemode selector in #pick-gamemodes.
   */
  public static async setupPickerPanel(channel: TextChannel): Promise<void> {
    try {
      const embed = this.buildPickerEmbed();
      const selectRow = this.createPickerSelectMenu();

      const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
      if (messages && messages.size > 0) {
        for (const m of Array.from(messages.values())) {
          await m.delete().catch(() => null);
        }
      }

      await channel.send({ embeds: [embed], components: [selectRow] });
    } catch (err) {
      console.warn("Failed to post ladder picker panel:", err);
    }
  }

  /**
   * Handles user selecting gamemodes from the dropdown menu.
   */
  public static async handleLadderSelect(interaction: StringSelectMenuInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const selectedKits = new Set(interaction.values as Kit[]);
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const rolesMap = await this.getOrCreateLadderRoles(interaction.guild);

    const addedKits: string[] = [];
    const removedKits: string[] = [];

    for (const [kit, role] of Array.from(rolesMap.entries())) {
      const kitMeta = KIT_MAP[kit];
      const hasRole = member.roles.cache.has(role.id);

      if (selectedKits.has(kit)) {
        if (!hasRole) {
          await member.roles.add(role).catch(() => null);
        }
        addedKits.push(`${kitMeta.emoji} **${kitMeta.name}**`);
      } else {
        if (hasRole) {
          await member.roles.remove(role).catch(() => null);
          removedKits.push(`${kitMeta.name}`);
        }
      }
    }

    const description =
      selectedKits.size === 0
        ? `You have deselected all ladders. Your queue channels are now hidden.`
        : `### Unlocked Channels (${selectedKits.size}):\n` +
          `${addedKits.join("\n")}\n\n` +
          `You can now view their queue channels under **\`⚔️ VYNTRIC QUEUES\`** in your sidebar! You can modify this selection anytime.`;

    const embed = createSuccessEmbed("Ladders Updated!", description)
      .setColor(VY_COLORS.green);

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * 1-Click: Unlock all 9 gamemode ladders.
   */
  public static async handleUnlockAll(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const rolesMap = await this.getOrCreateLadderRoles(interaction.guild);

    for (const role of Array.from(rolesMap.values())) {
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role).catch(() => null);
      }
    }

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "All Queues Unlocked!",
          "✅ You have unlocked all 9 competitive gamemode queue channels in your sidebar."
        ),
      ],
    });
  }

  /**
   * 1-Click: Hide all gamemode ladders.
   */
  public static async handleHideAll(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const rolesMap = await this.getOrCreateLadderRoles(interaction.guild);

    for (const role of Array.from(rolesMap.values())) {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(() => null);
      }
    }

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "All Queues Hidden",
          "🧹 All gamemode queue channels have been hidden from your sidebar. You can re-enable them anytime above!"
        ),
      ],
    });
  }
}

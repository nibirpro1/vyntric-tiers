import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextChannel,
  ButtonInteraction,
} from "discord.js";
import { config } from "../config.js";
import { createBaseEmbed, VY_COLORS, VY_BRAND } from "../embeds/brand.js";

export class SupportTicketService {
  /**
   * Builds the official Vyntric Support Tickets embed.
   */
  public static buildSupportEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x8b5cf6) // Purple / Staff Accent
      .setTitle("🛡️ Support Tickets")
      .setDescription(
        `> **General Support** — Have a question/issue, or need to reach staff about something. Open this if nothing else fits.\n\n` +
        `> **Player Report** — For reporting rule-breaking or a problematic player. Provide evidence.\n\n` +
        `> **Staff Report** — For reporting rule-breaking staff members. Provide evidence.\n\n` +
        `> **Tester Application** — For those interested in joining the Vyntric Certified Testing Council.\n\n` +
        `— Any troll / joke tickets will result in an according punishment.\n` +
        `— Please do **not** spam ping a staff member in your ticket.\n` +
        `— Appeals are currently handled through ticket review.`
      )
      .setFooter({
        text: `${VY_BRAND.footerText} • Confidential Support System`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Builds the dropdown menu for selecting ticket category.
   */
  public static createSupportSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
    const select = new StringSelectMenuBuilder()
      .setCustomId("support_ticket_select")
      .setPlaceholder("Select a Request")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Open a General Support Ticket")
          .setValue("ticket_general")
          .setDescription("Questions, account assistance, or tier inquiries")
          .setEmoji("📭"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Open a Report Ticket")
          .setValue("ticket_player_report")
          .setDescription("Report rule violations, cheating, or harassment")
          .setEmoji("📄"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Open a Staff Report Ticket")
          .setValue("ticket_staff_report")
          .setDescription("Confidential reporting of tester or staff misconduct")
          .setEmoji("📩"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Open a Tester Application")
          .setValue("ticket_tester_app")
          .setDescription("Apply for certified tester status on Vyntric ladders")
          .setEmoji("🏆")
      );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  }

  /**
   * Posts or updates the support panel in #support-tickets.
   */
  public static async setupSupportPanel(channel: TextChannel): Promise<void> {
    try {
      const embed = this.buildSupportEmbed();
      const row = this.createSupportSelectMenu();

      const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
      if (messages && messages.size > 0) {
        for (const m of Array.from(messages.values())) {
          await m.delete().catch(() => null);
        }
      }

      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.warn("Failed to post support tickets panel:", err);
    }
  }

  /**
   * Handles user selecting a ticket type from the dropdown.
   */
  public static async handleTicketSelect(interaction: StringSelectMenuInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const ticketType = interaction.values[0];
    const user = interaction.user;
    const guild = interaction.guild;

    // Resolve or find ticket category
    const category =
      guild.channels.cache.get(config.TESTER_CATEGORY_ID) ||
      guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes("ticket")
      );

    const typeNames: Record<string, string> = {
      ticket_general: "General Support",
      ticket_player_report: "Player Report",
      ticket_staff_report: "Staff Report",
      ticket_tester_app: "Tester Application",
    };

    const friendlyName = typeNames[ticketType] || "Support";
    const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15)}`;

    // Check if user already has an open ticket
    const existingTicket = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && c.name === channelName
    );

    if (existingTicket) {
      await interaction.editReply({
        content: `⚠️ You already have an open ticket: <#${existingTicket.id}>. Please resolve that ticket before opening another.`,
      });
      return;
    }

    try {
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category?.id,
        topic: `${friendlyName} Ticket for ${user.tag} (${user.id})`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.EmbedLinks,
            ],
          },
          {
            id: config.ROLE_HEAD_TESTER_ID || guild.roles.everyone.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          {
            id: config.ROLE_TESTER_ID || guild.roles.everyone.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
        ],
      });

      const ticketEmbed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle(`🛡️ ${friendlyName} Ticket`)
        .setDescription(
          `Welcome <@${user.id}>! Staff has been notified and will assist you shortly.\n\n` +
          `**Ticket Type:** \`${friendlyName}\`\n` +
          `**Created By:** \`${user.tag}\`\n\n` +
          `Please describe your inquiry, provide relevant IGNs, or attach proof/screenshots.\n` +
          `When you are finished, click the red **[Close Ticket]** button below.`
        )
        .setFooter({ text: "Vyntric Tiers • Confidential Support", iconURL: VY_BRAND.logoIcon })
        .setTimestamp();

      const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close_btn")
          .setLabel("Close Ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@${user.id}> Hello! Staff will be with you shortly.`,
        embeds: [ticketEmbed],
        components: [closeRow],
      });

      await interaction.editReply({
        content: `✅ Your ticket has been created: <#${ticketChannel.id}>`,
      });
    } catch (err: any) {
      await interaction.editReply({
        content: `❌ Failed to create ticket channel: ${err.message}`,
      });
    }
  }

  /**
   * Handles user or staff clicking [Close Ticket].
   */
  public static async handleCloseTicket(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;
    await interaction.reply({
      content: "🔒 **Closing Ticket:** This channel will be archived and deleted in 5 seconds...",
    });

    setTimeout(async () => {
      try {
        await (interaction.channel as TextChannel).delete("Ticket concluded");
      } catch {
        // Channel already deleted
      }
    }, 5000);
  }
}

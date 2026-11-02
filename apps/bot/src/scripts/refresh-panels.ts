import { Client, GatewayIntentBits, ChannelType, TextChannel, PermissionsBitField } from "discord.js";
import { config } from "../config.js";
import { QueueService } from "../services/queueService.js";
import { LadderRoleService } from "../services/ladderRoleService.js";
import { VerifyService } from "../services/verifyService.js";
import { SupportTicketService } from "../services/supportTicketService.js";
import { RulesService } from "../services/rulesService.js";
import { KITS } from "@vyntric/shared";

async function main() {
  console.log("🔄 Starting fresh Vyntric Tiers MCTiers-style panel deployment...");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.once("ready", async () => {
    console.log(`🤖 Logged in as ${client.user?.tag}`);

    try {
      const guild = await client.guilds.fetch(config.DISCORD_GUILD_ID);
      const channels = await guild.channels.fetch();

      // 1. Refresh #verify
      const verifyCh = channels.find((c) => c?.name === "verify") as TextChannel | undefined;
      if (verifyCh) {
        console.log("📝 Refreshing #verify...");
        const msgs = await verifyCh.messages.fetch({ limit: 20 }).catch(() => null);
        if (msgs && msgs.size > 0) {
          for (const m of Array.from(msgs.values())) {
            await m.delete().catch(() => null);
          }
        }
        await verifyCh.send({
          embeds: [VerifyService.buildVerifyEmbed()],
          components: [VerifyService.createVerifyButton()],
        });
        console.log("✅ #verify refreshed cleanly.");
      }

      // 2. Refresh #pick-gamemodes
      const pickerCh = channels.find((c) => c?.name === "pick-gamemodes") as TextChannel | undefined;
      if (pickerCh) {
        console.log("🎮 Refreshing #pick-gamemodes...");
        const msgs = await pickerCh.messages.fetch({ limit: 20 }).catch(() => null);
        if (msgs && msgs.size > 0) {
          for (const m of Array.from(msgs.values())) {
            await m.delete().catch(() => null);
          }
        }
        await pickerCh.send({
          embeds: [LadderRoleService.buildPickerEmbed()],
          components: [LadderRoleService.createPickerSelectMenu()],
        });
        console.log("✅ #pick-gamemodes refreshed cleanly.");
      }

      // 3. Setup / Refresh #support-tickets
      let supportCh = channels.find((c) => c?.name === "support-tickets") as TextChannel | undefined;
      if (!supportCh) {
        const verifyCat = channels.find((c) => c?.type === ChannelType.GuildCategory && c?.name.includes("VERIFICATION"));
        supportCh = await guild.channels.create({
          name: "support-tickets",
          type: ChannelType.GuildText,
          parent: verifyCat?.id,
          topic: "Open a support, report, or tester application ticket.",
        });
      }
      if (supportCh) {
        console.log("🛡️ Refreshing #support-tickets...");
        await SupportTicketService.setupSupportPanel(supportCh);
        console.log("✅ #support-tickets refreshed cleanly.");
      }

      // 4. Setup / Refresh #tiertesting-info and #rules
      const targetGuideChannels = channels.filter(
        (c) => c?.isTextBased() && (c.name.includes("tiertesting-info") || c.name === "rules")
      );
      if (targetGuideChannels.size > 0) {
        for (const ch of Array.from(targetGuideChannels.values())) {
          console.log(`📄 Refreshing guide & infographic in #${(ch as TextChannel).name}...`);
          await RulesService.setupRulesPanel(ch as TextChannel);
          console.log(`✅ #${(ch as TextChannel).name} refreshed cleanly.`);
        }
      } else {
        const infoCat = channels.find((c) => c?.type === ChannelType.GuildCategory && c?.name.includes("TIERS"));
        const rulesCh = await guild.channels.create({
          name: "tiertesting-info",
          type: ChannelType.GuildText,
          parent: infoCat?.id,
          topic: "Official Vyntric tier testing rules, queue mechanics, and infographic guide.",
        });
        console.log("📄 Refreshing #tiertesting-info...");
        await RulesService.setupRulesPanel(rulesCh);
        console.log("✅ #tiertesting-info refreshed cleanly.");
      }

      // 5. Refresh each dedicated gamemode waitlist channel (with 3 Purple Buttons)
      for (const kitMeta of KITS) {
        const kit = kitMeta.id;
        const channel = QueueService.findChannelForKit(guild, kit);
        if (!channel) {
          console.warn(`⚠️ Channel not found for kit: ${kit}`);
          continue;
        }

        console.log(`⚔️ Refreshing #${channel.name} (${kitMeta.name} Waitlist)...`);
        const msgs = await channel.messages.fetch({ limit: 20 }).catch(() => null);
        if (msgs && msgs.size > 0) {
          for (const m of Array.from(msgs.values())) {
            await m.delete().catch(() => null);
          }
        }

        const embed = await QueueService.buildQueueEmbed(kit);
        const row = QueueService.createQueueButtons(kit);
        await channel.send({ embeds: [embed], components: [row] });
        console.log(`✅ #${channel.name} deployed with MCTiers-style waitlist panel.`);
      }

      console.log("\n✨ ALL PANELS SUCCESSFULLY REFRESHED AND DEPLOYED!");
      client.destroy();
      process.exit(0);
    } catch (err) {
      console.error("❌ Panel refresh failed:", err);
      client.destroy();
      process.exit(1);
    }
  });

  await client.login(config.DISCORD_TOKEN);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

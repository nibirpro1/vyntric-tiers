import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../config.js";
import { GuildSetupService } from "../services/guildSetupService.js";

async function main() {
  console.log("🚀 Starting Vyntric Tiers Automated Server Setup...");

  if (!config.DISCORD_TOKEN || config.DISCORD_TOKEN === "dummy_token") {
    console.error("❌ DISCORD_TOKEN is missing in .env! Please set your token first.");
    process.exit(1);
  }

  if (!config.DISCORD_GUILD_ID || config.DISCORD_GUILD_ID === "dummy_guild_id") {
    console.error("❌ DISCORD_GUILD_ID is missing in .env! Please set your server ID first.");
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once("ready", async () => {
    console.log(`🤖 Logged in as ${client.user?.tag}`);
    try {
      const guild = await client.guilds.fetch(config.DISCORD_GUILD_ID);
      console.log(`🏰 Found Server: ${guild.name} (${guild.id})`);

      const result = await GuildSetupService.executeSetup(guild);

      console.log("\n========================================================");
      console.log("✅ VYNTRIC TIERS SERVER SETUP COMPLETED SUCCESSFULLY!");
      console.log("========================================================");
      console.log(`• Registered Role ID:   ${result.roles.registered.id}`);
      console.log(`• Active Tester Role ID: ${result.roles.activeTester.id}`);
      console.log(`• Head Tester Role ID:   ${result.roles.headTester.id}`);
      console.log(`• Tester Role ID:        ${result.roles.tester.id}`);
      console.log(`• Verify Channel ID:     ${result.verifyChannel.id}`);
      console.log(`• Picker Channel ID:     ${result.pickerChannel.id}`);
      console.log("--------------------------------------------------------");
      console.log("🎮 Ladder Roles Created:");
      for (const [kit, r] of result.roles.ladderRoles.entries()) {
        console.log(`  • ${kit}: @${r.name} (${r.id})`);
      }
      console.log("--------------------------------------------------------");
      console.log("⚔️ Dedicated Gamemode Queue Channels Created:");
      for (const [kit, ch] of result.queueChannels.entries()) {
        console.log(`  • ${kit}: #${ch.name} (${ch.id})`);
      }
      console.log("--------------------------------------------------------");
      console.log(`• Results Channel ID:    ${result.channels.results.id}`);
      console.log(`• Ticket Category ID:    ${result.categories.tickets.id}`);
      console.log(`• Transcripts Channel ID:${result.channels.transcripts.id}`);
      console.log(`• Staff Logs Channel ID: ${result.channels.staffLogs.id}`);
      console.log("========================================================");
      console.log("💾 .env file updated automatically on disk!");
      console.log("⚔️ Queue panels initialized in #queue channel.");

      client.destroy();
      process.exit(0);
    } catch (err: any) {
      console.error("❌ Setup failed:", err.message);
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

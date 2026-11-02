import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import { handleInteraction } from "./events/interactionCreate";
import { QueueService } from "./services/queueService";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.once("ready", async () => {
  console.log(`🤖 Vyntric Tiers Bot logged in as ${client.user?.tag}!`);

  // Auto-deploy slash commands on startup
  await deployCommands();

  // Setup / refresh queue panels
  await QueueService.setupOrRefreshPanels(client);
  console.log("⚔️ Queue panels initialized.");
});

client.on("interactionCreate", async (interaction) => {
  await handleInteraction(interaction);
});

// Start bot if token provided
if (config.DISCORD_TOKEN && config.DISCORD_TOKEN !== "dummy_token") {
  client.login(config.DISCORD_TOKEN).catch((err) => {
    console.error("❌ Discord login failed:", err.message);
  });
} else {
  console.log("ℹ️ Bot initialized in dry-run mode (no DISCORD_TOKEN set). Set DISCORD_TOKEN in .env to connect to Discord Gateway.");
}

process.on("SIGINT", async () => {
  console.log("Shutting down bot...");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down bot...");
  client.destroy();
  process.exit(0);
});

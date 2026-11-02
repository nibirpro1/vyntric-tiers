import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { config } from "./config.js";
import { deployCommands } from "./deploy-commands.js";
import { handleInteraction } from "./events/interactionCreate.js";
import { QueueService } from "./services/queueService.js";
import { McVerifyServer } from "./services/mcVerifyServer.js";

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
  console.log(`🤖 ${config.BOT_NAME} logged in as ${client.user?.tag}!`);

  // Set rich Discord status
  client.user?.setPresence({
    activities: [
      {
        name: `${config.WEBSITE_URL.replace(/^https?:\/\//, "")} • /help`,
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  // Auto-deploy slash commands on startup
  await deployCommands();

  // Setup / refresh queue panels in #queue
  await QueueService.setupOrRefreshPanels(client);
  console.log("⚔️ Queue panels initialized.");

  // Start Minecraft Java Edition in-game verification server
  McVerifyServer.start(client);
});

client.on("interactionCreate", async (interaction) => {
  await handleInteraction(interaction);
});

// Robust Discord client error handling
client.on("error", (error) => {
  console.error("❌ Discord Client Error:", error);
});

client.on("warn", (warning) => {
  console.warn("⚠️ Discord Client Warning:", warning);
});

// Prevent unhandled crashes in production
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
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

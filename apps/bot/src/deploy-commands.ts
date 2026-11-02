import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./events/interactionCreate";

export async function deployCommands() {
  const commandData = Array.from(commands.values()).map((c) => c.data.toJSON());

  if (!config.DISCORD_TOKEN || config.DISCORD_TOKEN === "dummy_token") {
    console.warn("⚠️ DISCORD_TOKEN not set. Skipping command registration.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

  try {
    console.log(`🚀 Refreshing ${commandData.length} application (/) commands...`);

    if (config.DISCORD_GUILD_ID && config.DISCORD_GUILD_ID !== "dummy_guild_id") {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body: commandData }
      );
      console.log(`✅ Successfully reloaded commands for Guild: ${config.DISCORD_GUILD_ID}`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
        body: commandData,
      });
      console.log("✅ Successfully reloaded global application commands.");
    }
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}

import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load from current directory and parent directory if present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const rawEnv = {
  ...process.env,
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  WEBSITE_URL: process.env.WEBSITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://vyntric.gg",
};

const envSchema = z.object({
  BOT_NAME: z.string().default("Vyntric Tiers"),
  DISCORD_TOKEN: z.string().default("dummy_token"),
  DISCORD_CLIENT_ID: z.string().default("dummy_client_id"),
  DISCORD_GUILD_ID: z.string().default("dummy_guild_id"),
  DATABASE_URL: z.string().optional(),
  QUEUE_CHANNEL_ID: z.string().default(""),
  RESULTS_CHANNEL_ID: z.string().default(""),
  TRANSCRIPTS_CHANNEL_ID: z.string().default(""),
  STAFF_LOGS_CHANNEL_ID: z.string().default(""),
  TESTER_CATEGORY_ID: z.string().default(""),
  ROLE_REGISTERED_ID: z.string().default(""),
  ROLE_ACTIVE_TESTER_ID: z.string().default(""),
  ROLE_HEAD_TESTER_ID: z.string().default(""),
  ROLE_OWNER_ID: z.string().default(""),
  ROLE_TESTER_ID: z.string().default(""),
  SUPABASE_URL: z.string().default(""),
  SUPABASE_SERVICE_KEY: z.string().default(""),
  WEBSITE_URL: z.string().default("https://vyntric.gg"),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
}

export const config = parsed.success ? parsed.data : envSchema.parse({});

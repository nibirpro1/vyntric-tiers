import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
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

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
}

export const config = parsed.success ? parsed.data : envSchema.parse({});

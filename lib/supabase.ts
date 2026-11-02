import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(url?: string): boolean {
  if (!url) return false;
  if (url.includes("[") || url.includes("YOUR-PROJECT-REF") || url.includes("placeholder")) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const supabase: SupabaseClient | null = (() => {
  if (
    !isValidSupabaseUrl(supabaseUrl) ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes("...") ||
    supabaseAnonKey.includes("YOUR-KEY")
  ) {
    return null;
  }

  try {
    return createClient(supabaseUrl!, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn("Supabase client initialization skipped:", err);
    return null;
  }
})();

export const isRealtimeConfigured = Boolean(supabase);

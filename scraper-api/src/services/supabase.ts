import { createClient } from "@supabase/supabase-js";
import { env } from "../utils/env.js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    if (!env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL is not configured");
    }

    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for the Scraper API");
    }

    client = createClient(env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return client as any;
}

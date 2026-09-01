import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../database/types/supabase.generated";

let client: SupabaseClient<Database> | null | undefined;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (client !== undefined) return client;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    client = null;
    return client;
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

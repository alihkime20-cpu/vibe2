import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database/types/supabase.generated";

let adminClient: SupabaseClient<Database> | null = null;

export function getAdminSupabase() {
  if (adminClient) return adminClient;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}

export function getEditorialToken() {
  return process.env.EDITORIAL_ADMIN_TOKEN || "";
}

export function getPublicSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || "",
  };
}

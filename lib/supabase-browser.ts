import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Klien Supabase di browser untuk login pengunjung. Sesi disimpan di browser;
 * server tidak membaca cookie, melainkan menerima token lewat header Authorization.
 */
export function getBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  client ??= createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // pertukaran kode ditangani manual di /auth/callback dan /auth/confirm
      flowType: "pkce",
    },
  });
  return client;
}

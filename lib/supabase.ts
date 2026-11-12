import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PUSTAKA_BUCKET = "pustaka";

let cached: SupabaseClient | null = null;

/** Klien server (service role). Jangan pernah dipakai di komponen client. */
export function getDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cached ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function requireDb(): SupabaseClient {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Supabase belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return db;
}

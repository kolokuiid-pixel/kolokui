// Pengunjung yang login lewat Supabase Auth. Browser mengirim token sesinya di header
// "Authorization: Bearer ...", server memeriksanya ke Supabase, lalu memakai service role
// untuk membaca/menulis tabel (tabel tidak bisa diakses langsung dari browser).

import type { User } from "@supabase/supabase-js";
import { requireDb } from "./supabase";

export type Visitor = {
  id: string;
  email: string;
  name: string;
  blocked: boolean;
};

function bearer(req: Request): string {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

/** Siapa yang bertanya (tanpa menyentuh database kita). Null kalau belum login atau token tidak sah. */
export async function authUser(req: Request): Promise<User | null> {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await requireDb().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function defaultName(u: User): string {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const fromMeta = String(meta.full_name ?? meta.name ?? "").trim();
  const fromEmail = (u.email ?? "").split("@")[0];
  return (fromMeta || fromEmail || "Pengunjung").slice(0, 60);
}

/** Pengunjung beserta nama tampilan dan status blokir. Profil dibuat otomatis saat pertama kali. */
export async function visitorFromRequest(req: Request): Promise<Visitor | null> {
  const u = await authUser(req);
  if (!u) return null;
  const db = requireDb();

  const { data } = await db
    .from("visitor_profiles")
    .select("display_name, blocked")
    .eq("user_id", u.id)
    .maybeSingle();
  const row = data as { display_name: string; blocked: boolean } | null;
  if (row) {
    return { id: u.id, email: u.email ?? "", name: row.display_name, blocked: row.blocked };
  }

  const name = defaultName(u);
  await db
    .from("visitor_profiles")
    .upsert({ user_id: u.id, display_name: name }, { onConflict: "user_id", ignoreDuplicates: true });
  return { id: u.id, email: u.email ?? "", name, blocked: false };
}

/** Jumlah kiriman pengunjung sejak waktu tertentu, untuk membatasi spam. */
export async function countRecent(
  table: "comments" | "messages",
  userId: string,
  sinceIso: string,
): Promise<number> {
  let q = requireDb()
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", sinceIso);
  if (table === "messages") q = q.eq("sender", "user");
  const { count } = await q;
  return count ?? 0;
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireRomo } from "@/lib/auth";
import { IMAGE_BUCKET } from "@/lib/images";
import { UUID } from "@/lib/api";
import { sendNotification, siteUrl } from "@/lib/notify";
import { requireDb } from "@/lib/supabase";

/* ---------------- Profil Romo ---------------- */

export async function saveProfil(input: {
  nama: string;
  peran: string;
  bio: string;
  kisah: string;
  fotoPath: string | null;
}): Promise<{ error?: string }> {
  await requireAdmin();
  const nama = input.nama.trim().slice(0, 120);
  const peran = input.peran.trim().slice(0, 300);
  const bio = input.bio.trim().slice(0, 8000);
  const kisah = input.kisah.trim().slice(0, 12000);
  const fotoPath = input.fotoPath && !input.fotoPath.startsWith("/") && !input.fotoPath.includes("..")
    ? input.fotoPath
    : null;

  const db = requireDb();
  const { data: old } = await db
    .from("site_profile")
    .select("foto_path")
    .eq("id", 1)
    .maybeSingle();
  const oldPath = (old as { foto_path: string | null } | null)?.foto_path ?? null;

  const { error } = await db.from("site_profile").upsert({
    id: 1,
    nama,
    peran,
    bio,
    kisah,
    foto_path: fotoPath,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  if (oldPath && oldPath !== fotoPath) {
    await db.storage.from(IMAGE_BUCKET).remove([oldPath]);
  }
  revalidatePath("/", "layout");
  return {};
}

/* ---------------- Komentar ---------------- */

export async function setKomentarHidden(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const hidden = fd.get("hidden") === "1";
  if (!UUID.test(id)) return;
  await requireDb().from("comments").update({ hidden }).eq("id", id);
  revalidatePath("/admin/komentar");
}

export async function deleteKomentar(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) return;
  await requireDb().from("comments").delete().eq("id", id);
  revalidatePath("/admin/komentar");
}

/** Blokir atau buka blokir pengunjung. Boleh untuk kedua peran. */
export async function setBlocked(fd: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(fd.get("userId") ?? "");
  const blocked = fd.get("blocked") === "1";
  if (!UUID.test(userId)) return;
  await requireDb().from("visitor_profiles").update({ blocked }).eq("user_id", userId);
  revalidatePath("/admin/komentar");
  revalidatePath(`/admin/pesan/${userId}`);
  revalidatePath("/admin/pesan");
}

/* ---------------- Pesan (hanya Romo) ---------------- */

export async function kirimBalasan(input: {
  userId: string;
  body: string;
}): Promise<{ error?: string }> {
  await requireRomo();
  const body = input.body.trim();
  if (!UUID.test(input.userId)) return { error: "Percakapan tidak ditemukan." };
  if (!body) return { error: "Balasan masih kosong." };
  if (body.length > 4000) return { error: "Balasan terlalu panjang (maksimal 4000 huruf)." };

  const db = requireDb();
  const { data: conv } = await db
    .from("conversations")
    .select("user_id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (!conv) return { error: "Percakapan tidak ditemukan." };

  const { error } = await db
    .from("messages")
    .insert({ user_id: input.userId, sender: "romo", body });
  if (error) return { error: `Gagal mengirim: ${error.message}` };

  const now = new Date().toISOString();
  await db
    .from("conversations")
    .update({ last_message_at: now, last_romo_message_at: now, romo_read_at: now })
    .eq("user_id", input.userId);

  // Pemberitahuan tanpa isi pesan.
  const { data: u } = await db.auth.admin.getUserById(input.userId);
  await sendNotification(
    u?.user?.email ?? undefined,
    "Romo membalas pesanmu di Kolokui",
    `Ada balasan baru dari Romo untukmu.\n\nBuka: ${siteUrl()}/pesan\n\nSalam,\nKolokui`,
  );

  revalidatePath(`/admin/pesan/${input.userId}`);
  revalidatePath("/admin/pesan");
  return {};
}

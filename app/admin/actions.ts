"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { IMAGE_BUCKET } from "@/lib/images";
import { renderMarkdown } from "@/lib/posts";
import { isRubrik } from "@/lib/rubrik";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  checkPassword,
  createSession,
} from "@/lib/session";
import { slugify } from "@/lib/slug";
import { PUSTAKA_BUCKET, requireDb } from "@/lib/supabase";

const ADMIN_PATH = "/admin";

function refreshPublicSite() {
  revalidatePath("/", "layout");
}

function badPath(p: string): boolean {
  return p.startsWith("/") || p.includes("..");
}

/* ---------------- Login ---------------- */

export async function login(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const password = String(formData.get("password") ?? "");
  const check = await checkPassword(password);

  if (check === "unconfigured") {
    return {
      error:
        "Server belum diatur: isi ADMIN_PASSWORD dan ADMIN_SESSION_SECRET (min. 16 karakter).",
    };
  }
  if (check === "wrong") {
    await new Promise((r) => setTimeout(r, 800)); // memperlambat tebak-tebakan password
    return { error: "Password salah." };
  }

  (await cookies()).set(COOKIE_NAME, await createSession(check.role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ADMIN_PATH,
    maxAge: SESSION_MAX_AGE,
  });
  redirect(ADMIN_PATH);
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_NAME, path: ADMIN_PATH });
  redirect("/admin/login");
}

/* ---------------- Tulisan ---------------- */

export async function previewMarkdown(body: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(body);
}

/** Tiket upload foto: browser mengirim foto (yang sudah dikecilkan) langsung ke Supabase. */
export async function createImageUploadUrl(): Promise<
  { error: string } | { path: string; token: string }
> {
  await requireAdmin();
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
  const { data, error } = await requireDb()
    .storage.from(IMAGE_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return {
      error: `Gagal menyiapkan upload foto: ${error?.message ?? "tidak diketahui"}. Sudah menjalankan migrasi-foto.sql?`,
    };
  }
  return { path: data.path, token: data.token };
}

export async function savePost(fd: FormData): Promise<{ error: string } | void> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "");
  const rubrik = String(fd.get("rubrik") ?? "");
  const title = String(fd.get("title") ?? "").trim();
  const slug = slugify(String(fd.get("slug") ?? "") || title);
  const date = String(fd.get("date") ?? "");
  const ringkasan = String(fd.get("ringkasan") ?? "").trim();
  const body = String(fd.get("body") ?? "");
  const cover = String(fd.get("cover") ?? "") || null;
  const published = fd.get("intent") === "publish";
  const featured = published && fd.get("featured") === "1";

  if (!isRubrik(rubrik)) return { error: "Pilih rubrik dulu." };
  if (!title) return { error: "Judul belum diisi." };
  if (!slug) return { error: "Alamat tulisan (slug) belum diisi." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  if (published && !body.trim()) return { error: "Isi tulisan masih kosong." };
  if (cover && badPath(cover)) return { error: "Foto sampul tidak valid." };

  const row = {
    rubrik,
    slug,
    title,
    date,
    ringkasan,
    body,
    published,
    featured,
    cover_path: cover,
    updated_at: new Date().toISOString(),
  };

  const db = requireDb();

  // Bagian Pilihan di Beranda maksimal 3 tulisan.
  if (featured) {
    let q = db
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("featured", true);
    if (id) q = q.neq("id", id);
    const { count, error: cErr } = await q;
    if (cErr && cErr.message.includes("featured")) {
      return { error: "Kolom Pilihan belum ada di database. Jalankan supabase/migrasi-pilihan.sql dulu di Supabase." };
    }
    if ((count ?? 0) >= 3) {
      return { error: "Pilihan di Beranda sudah 3 tulisan. Lepas tanda Pilihan dari tulisan lain dulu." };
    }
  }

  // Foto sampul lama dihapus dari penyimpanan kalau diganti atau dibuang.
  let oldCover: string | null = null;
  if (id) {
    const { data } = await db
      .from("posts")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    oldCover = (data as { cover_path: string | null } | null)?.cover_path ?? null;
  }

  const { error } = id
    ? await db.from("posts").update(row).eq("id", id)
    : await db.from("posts").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { error: "Alamat (slug) itu sudah dipakai tulisan lain di rubrik ini. Ganti sedikit." };
    }
    if (error.message.includes("featured")) {
      return { error: "Kolom Pilihan belum ada di database. Jalankan supabase/migrasi-pilihan.sql dulu di Supabase." };
    }
    if (error.message.includes("cover_path")) {
      return { error: "Kolom foto belum ada di database. Jalankan supabase/migrasi-foto.sql dulu di Supabase." };
    }
    return { error: `Gagal menyimpan: ${error.message}` };
  }

  if (oldCover && oldCover !== cover) {
    await db.storage.from(IMAGE_BUCKET).remove([oldCover]);
  }

  refreshPublicSite();
  redirect(`${ADMIN_PATH}?ok=${published ? "terbit" : "draf"}`);
}

export async function deletePost(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) {
    const db = requireDb();
    const { data } = await db
      .from("posts")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    const cover = (data as { cover_path: string | null } | null)?.cover_path;
    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus: ${error.message}`);
    if (cover) await db.storage.from(IMAGE_BUCKET).remove([cover]);
  }
  refreshPublicSite();
  redirect(`${ADMIN_PATH}?ok=hapus`);
}

/* ---------------- Pustaka ---------------- */

const ALLOWED_EXT = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip"];

/** Langkah 1 upload: server memberi tiket upload; browser mengirim file langsung ke Supabase. */
export async function createUploadUrl(
  filename: string,
): Promise<{ error: string } | { path: string; token: string }> {
  await requireAdmin();

  const m = /\.([a-z0-9]{2,5})$/i.exec(filename);
  const ext = m ? m[1].toLowerCase() : "";
  if (!ALLOWED_EXT.includes(ext)) {
    return {
      error: `Jenis file belum didukung. Boleh: ${ALLOWED_EXT.join(", ")}.`,
    };
  }

  const base = slugify(filename.replace(/\.[^.]+$/, "")) || "file";
  const path = `${Date.now()}-${base}.${ext}`;
  const { data, error } = await requireDb()
    .storage.from(PUSTAKA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { error: `Gagal menyiapkan upload: ${error?.message ?? "tidak diketahui"}` };
  }
  return { path: data.path, token: data.token };
}

export async function savePustaka(input: {
  judul: string;
  jenis: string;
  tahun: string;
  filePath: string | null;
}): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const judul = input.judul.trim();
  const jenis = input.jenis.trim();
  const tahun = input.tahun.trim();
  const filePath = input.filePath;

  if (!judul) return { error: "Judul belum diisi." };
  if (!jenis) return { error: "Pilih jenis bahan." };
  if (filePath && badPath(filePath)) {
    return { error: "Lokasi file tidak valid." };
  }

  const { error } = await requireDb()
    .from("pustaka")
    .insert({ judul, jenis, tahun, file_path: filePath });
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  refreshPublicSite();
  return { ok: true };
}

export async function deletePustaka(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) {
    const db = requireDb();
    const { data } = await db
      .from("pustaka")
      .select("file_path")
      .eq("id", id)
      .maybeSingle();
    const filePath = (data as { file_path: string | null } | null)?.file_path;
    if (filePath) await db.storage.from(PUSTAKA_BUCKET).remove([filePath]);
    const { error } = await db.from("pustaka").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus: ${error.message}`);
  }
  refreshPublicSite();
  redirect(`${ADMIN_PATH}/pustaka?ok=hapus`);
}

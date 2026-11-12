import { cache } from "react";
import { remark } from "remark";
import html from "remark-html";
import { imageUrl } from "./images";
import { PUSTAKA_BUCKET, getDb, requireDb } from "./supabase";
import type { RubrikSlug } from "./rubrik";

export type Post = {
  id: string;
  rubrik: RubrikSlug;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  published: boolean;
  featured: boolean;
  cover: string | null; // alamat publik foto sampul
  coverPath: string | null; // lokasi di bucket (dipakai admin)
};

export type PostFull = Post & { body: string };

type Row = {
  id: string;
  rubrik: RubrikSlug;
  slug: string;
  title: string;
  date: string;
  ringkasan: string | null;
  body?: string | null;
  published: boolean;
  featured: boolean | null;
  cover_path: string | null;
};

const LIST_COLS = "id, rubrik, slug, title, date, ringkasan, published, featured, cover_path";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toPost(r: Row): Post {
  return {
    id: r.id,
    rubrik: r.rubrik,
    slug: r.slug,
    title: r.title,
    date: r.date,
    excerpt: r.ringkasan ?? "",
    published: r.published,
    featured: r.featured ?? false,
    coverPath: r.cover_path ?? null,
    cover: r.cover_path ? imageUrl(r.cover_path) : null,
  };
}

export { formatDate } from "./format";

/** Markdown -> HTML. remark-html membersihkan (sanitize) HTML berbahaya secara bawaan. */
export async function renderMarkdown(md: string): Promise<string> {
  const file = await remark().use(html).process(md);
  return String(file);
}

/* ---------- Publik: hanya tulisan yang sudah terbit ---------- */

export async function getPosts(rubrik?: RubrikSlug): Promise<Post[]> {
  const db = getDb();
  if (!db) return []; // Supabase belum diatur: situs tetap bisa tampil kosong.
  let q = db.from("posts").select(LIST_COLS).eq("published", true);
  if (rubrik) q = q.eq("rubrik", rubrik);
  const { data, error } = await q
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toPost);
}

/** Tulisan pilihan Romo untuk bagian atas Beranda (maksimal 3, yang terbaru dulu). */
export async function getFeatured(): Promise<Post[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("posts")
    .select(LIST_COLS)
    .eq("published", true)
    .eq("featured", true)
    .order("date", { ascending: false })
    .limit(3);
  if (error) return []; // kolom belum dibuat: bagian Pilihan disembunyikan saja
  return ((data ?? []) as Row[]).map(toPost);
}

export const getPost = cache(async (rubrik: RubrikSlug, slug: string) => {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("posts")
    .select(`${LIST_COLS}, body`)
    .eq("rubrik", rubrik)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as Row;
  return { ...toPost(row), html: await renderMarkdown(row.body ?? "") };
});

export type PustakaItem = {
  id: string;
  judul: string;
  jenis: string;
  tahun: string;
  filePath: string | null;
  file: string | null;
};

type PustakaRow = {
  id: string;
  judul: string;
  jenis: string;
  tahun: string | null;
  file_path: string | null;
};

export async function getPustaka(): Promise<PustakaItem[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("pustaka")
    .select("id, judul, jenis, tahun, file_path")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PustakaRow[]).map((r) => ({
    id: r.id,
    judul: r.judul,
    jenis: r.jenis,
    tahun: r.tahun ?? "",
    filePath: r.file_path,
    file: r.file_path
      ? db.storage
          .from(PUSTAKA_BUCKET)
          .getPublicUrl(r.file_path, { download: true }).data.publicUrl
      : null,
  }));
}

/* ---------- Admin: termasuk draf ---------- */

export async function adminGetPosts(): Promise<Post[]> {
  const { data, error } = await requireDb()
    .from("posts")
    .select(LIST_COLS)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toPost);
}

export async function adminGetPost(id: string): Promise<PostFull | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await requireDb()
    .from("posts")
    .select(`${LIST_COLS}, body`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as Row;
  return { ...toPost(row), body: row.body ?? "" };
}

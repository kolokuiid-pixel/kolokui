import { UUID, fail, json, readJson } from "@/lib/api";
import { getDb } from "@/lib/supabase";
import { authUser, countRecent, visitorFromRequest } from "@/lib/visitor";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function shape(r: Row, me: string | null) {
  return {
    id: r.id,
    name: r.author_name,
    body: r.body,
    createdAt: r.created_at,
    mine: r.user_id === me,
  };
}

/** Komentar yang tampil untuk satu tulisan. Publik; kalau ada token, komentar milik sendiri ditandai. */
export async function GET(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);

  const postId = new URL(req.url).searchParams.get("post") ?? "";
  if (!UUID.test(postId)) return fail("Tulisan tidak valid.");

  const { data, error } = await db
    .from("comments")
    .select("id, user_id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("hidden", false)
    .order("created_at", { ascending: true })
    .limit(300);
  if (error) {
    return fail(
      error.message.includes("comments")
        ? "Fitur komentar belum disiapkan di database (migrasi-komunitas.sql)."
        : "Gagal memuat komentar.",
      500,
    );
  }

  const me = (await authUser(req))?.id ?? null;
  return json({ comments: ((data ?? []) as Row[]).map((r) => shape(r, me)) });
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);

  const visitor = await visitorFromRequest(req);
  if (!visitor) return fail("Masuk dulu untuk berkomentar.", 401);
  if (visitor.blocked) return fail("Akunmu tidak bisa berkomentar.", 403);

  const payload = await readJson(req);
  if (!payload) return fail("Permintaan tidak valid.");
  const postId = String(payload.postId ?? "");
  const body = String(payload.body ?? "").trim();
  if (!UUID.test(postId)) return fail("Tulisan tidak valid.");
  if (body.length < 1) return fail("Komentar masih kosong.");
  if (body.length > 2000) return fail("Komentar terlalu panjang (maksimal 2000 huruf).");

  const { data: post } = await db
    .from("posts")
    .select("id")
    .eq("id", postId)
    .eq("published", true)
    .maybeSingle();
  if (!post) return fail("Tulisan tidak ditemukan.", 404);

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  if ((await countRecent("comments", visitor.id, since)) >= 5) {
    return fail("Terlalu banyak komentar. Coba lagi beberapa menit lagi.", 429);
  }

  const { data, error } = await db
    .from("comments")
    .insert({
      post_id: postId,
      user_id: visitor.id,
      author_name: visitor.name,
      body,
    })
    .select("id, user_id, author_name, body, created_at")
    .single();
  if (error || !data) return fail("Komentar gagal disimpan.", 500);

  return json({ comment: shape(data as Row, visitor.id) }, 201);
}

/** Pengunjung menghapus komentarnya sendiri. */
export async function DELETE(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);

  const user = await authUser(req);
  if (!user) return fail("Masuk dulu.", 401);

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!UUID.test(id)) return fail("Komentar tidak valid.");

  const { error } = await db.from("comments").delete().eq("id", id).eq("user_id", user.id);
  if (error) return fail("Gagal menghapus.", 500);
  return json({ ok: true });
}

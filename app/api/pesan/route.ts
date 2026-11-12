import { fail, json, readJson } from "@/lib/api";
import { sendNotification, siteUrl } from "@/lib/notify";
import { isUnread } from "@/lib/pesan";
import { getDb } from "@/lib/supabase";
import { countRecent, visitorFromRequest } from "@/lib/visitor";

export const dynamic = "force-dynamic";

type Msg = { id: string; sender: "user" | "romo"; body: string; created_at: string };

/**
 * Percakapan milik pengunjung yang sedang login.
 * ?peek=1 hanya memberi tahu apakah ada balasan Romo yang belum dibaca (untuk titik di menu).
 */
export async function GET(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);

  const visitor = await visitorFromRequest(req);
  if (!visitor) return fail("Masuk dulu.", 401);

  if (new URL(req.url).searchParams.get("peek")) {
    const { data } = await db
      .from("conversations")
      .select("last_romo_message_at, user_read_at")
      .eq("user_id", visitor.id)
      .maybeSingle();
    const c = data as { last_romo_message_at: string | null; user_read_at: string | null } | null;
    const unread =
      !!c?.last_romo_message_at &&
      (!c.user_read_at ||
        new Date(c.last_romo_message_at).getTime() > new Date(c.user_read_at).getTime());
    return json({ unread });
  }

  const { data, error } = await db
    .from("messages")
    .select("id, sender, body, created_at")
    .eq("user_id", visitor.id)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    return fail(
      error.message.includes("messages")
        ? "Fitur pesan belum disiapkan di database (migrasi-komunitas.sql)."
        : "Gagal memuat pesan.",
      500,
    );
  }

  await db
    .from("conversations")
    .update({ user_read_at: new Date().toISOString() })
    .eq("user_id", visitor.id);

  return json({
    name: visitor.name,
    blocked: visitor.blocked,
    messages: ((data ?? []) as Msg[]).map((m) => ({
      id: m.id,
      from: m.sender,
      body: m.body,
      createdAt: m.created_at,
    })),
  });
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);

  const visitor = await visitorFromRequest(req);
  if (!visitor) return fail("Masuk dulu untuk mengirim pesan.", 401);
  if (visitor.blocked) return fail("Akunmu tidak bisa mengirim pesan.", 403);

  const payload = await readJson(req);
  if (!payload) return fail("Permintaan tidak valid.");
  const body = String(payload.body ?? "").trim();
  if (body.length < 1) return fail("Pesan masih kosong.");
  if (body.length > 4000) return fail("Pesan terlalu panjang (maksimal 4000 huruf).");

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  if ((await countRecent("messages", visitor.id, since)) >= 20) {
    return fail("Terlalu banyak pesan dalam satu jam. Coba lagi nanti.", 429);
  }

  // Pastikan percakapan ada, lalu cek apakah pesan sebelumnya sudah dibaca Romo.
  await db
    .from("conversations")
    .upsert({ user_id: visitor.id }, { onConflict: "user_id", ignoreDuplicates: true });
  const { data: conv } = await db
    .from("conversations")
    .select("last_user_message_at, romo_read_at")
    .eq("user_id", visitor.id)
    .maybeSingle();
  const c = conv as { last_user_message_at: string | null; romo_read_at: string | null } | null;
  const alreadyUnread = isUnread(c?.last_user_message_at ?? null, c?.romo_read_at ?? null);

  const { data, error } = await db
    .from("messages")
    .insert({ user_id: visitor.id, sender: "user", body })
    .select("id, sender, body, created_at")
    .single();
  if (error || !data) return fail("Pesan gagal terkirim.", 500);

  const now = new Date().toISOString();
  await db
    .from("conversations")
    .update({ last_message_at: now, last_user_message_at: now, user_read_at: now })
    .eq("user_id", visitor.id);

  // Satu email per "gelombang" pesan belum dibaca, supaya kotak masuk Romo tidak penuh.
  if (!alreadyUnread) {
    await sendNotification(
      process.env.ROMO_NOTIFY_EMAIL,
      "Pesan baru di Kolokui",
      `${visitor.name} mengirim pesan baru.\n\nBaca dan balas di: ${siteUrl()}/admin/pesan`,
    );
  }

  const m = data as Msg;
  return json(
    { message: { id: m.id, from: m.sender, body: m.body, createdAt: m.created_at } },
    201,
  );
}

import { fail, json, readJson } from "@/lib/api";
import { getDb } from "@/lib/supabase";
import { visitorFromRequest } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!getDb()) return fail("Layanan belum diatur.", 503);
  const visitor = await visitorFromRequest(req);
  if (!visitor) return fail("Masuk dulu.", 401);
  return json({ name: visitor.name, email: visitor.email, blocked: visitor.blocked });
}

/** Mengganti nama tampilan. Komentar lama tetap memakai nama saat ditulis. */
export async function PUT(req: Request) {
  const db = getDb();
  if (!db) return fail("Layanan belum diatur.", 503);
  const visitor = await visitorFromRequest(req);
  if (!visitor) return fail("Masuk dulu.", 401);

  const payload = await readJson(req);
  const name = String(payload?.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2) return fail("Nama minimal 2 huruf.");
  if (name.length > 60) return fail("Nama maksimal 60 huruf.");

  const { error } = await db
    .from("visitor_profiles")
    .update({ display_name: name })
    .eq("user_id", visitor.id);
  if (error) return fail("Gagal menyimpan nama.", 500);
  return json({ name });
}

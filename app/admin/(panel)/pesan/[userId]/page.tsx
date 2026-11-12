import Link from "next/link";
import { notFound } from "next/navigation";
import { setBlocked } from "@/app/admin/actions-komunitas";
import { UUID } from "@/lib/api";
import { requireRomo } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { requireDb } from "@/lib/supabase";
import AutoRefresh from "../AutoRefresh";
import BalasForm from "./BalasForm";

export const dynamic = "force-dynamic";

type Msg = { id: string; sender: "user" | "romo"; body: string; created_at: string };

export default async function Percakapan({ params }: { params: Promise<{ userId: string }> }) {
  await requireRomo();
  const { userId } = await params;
  if (!UUID.test(userId)) notFound();

  const db = requireDb();
  const { data: conv } = await db.from("conversations").select("user_id").eq("user_id", userId).maybeSingle();
  if (!conv) notFound();

  const [{ data: msgs }, { data: prof }, { data: u }] = await Promise.all([
    db.from("messages").select("id, sender, body, created_at").eq("user_id", userId).order("created_at", { ascending: true }).limit(500),
    db.from("visitor_profiles").select("display_name, blocked").eq("user_id", userId).maybeSingle(),
    db.auth.admin.getUserById(userId),
  ]);

  // Menandai sudah dibaca.
  await db.from("conversations").update({ romo_read_at: new Date().toISOString() }).eq("user_id", userId);

  const name = (prof as { display_name: string } | null)?.display_name ?? "Pengunjung";
  const blocked = (prof as { blocked: boolean } | null)?.blocked ?? false;
  const email = u?.user?.email ?? "";

  return (
    <>
      <AutoRefresh />
      <div className="admin-head">
        <h1 className="page-title">{name}</h1>
      </div>
      <p className="note">
        <Link href="/admin/pesan">&larr; Semua pesan</Link>
        {email ? ` · ${email}` : ""}
      </p>

      <div className="chat" style={{ marginTop: 20 }}>
        <div className="chat-log" style={{ maxHeight: "none" }}>
          {((msgs ?? []) as Msg[]).map((m) => (
            <div key={m.id} className={`bubble ${m.sender === "romo" ? "bubble-me" : "bubble-romo"}`}>
              {m.body}
              <span className="bubble-time">{formatDateTime(m.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      <BalasForm userId={userId} />

      <form action={setBlocked} style={{ marginTop: 32 }}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="blocked" value={blocked ? "0" : "1"} />
        <button type="submit" className="link-btn">
          {blocked ? "Buka blokir pengunjung ini" : "Blokir pengunjung ini"}
        </button>
      </form>
    </>
  );
}

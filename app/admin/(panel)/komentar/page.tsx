import { deleteKomentar, setBlocked, setKomentarHidden } from "@/app/admin/actions-komunitas";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getDb } from "@/lib/supabase";
import ConfirmButton from "../ConfirmButton";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  hidden: boolean;
  created_at: string;
};

export default async function AdminKomentar() {
  await requireAdmin();
  const db = getDb();
  let rows: Row[] = [];
  const titles = new Map<string, string>();
  const blocked = new Set<string>();

  if (db) {
    const { data } = await db
      .from("comments")
      .select("id, post_id, user_id, author_name, body, hidden, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data ?? []) as Row[];
    if (rows.length > 0) {
      const { data: ps } = await db
        .from("posts")
        .select("id, title")
        .in("id", [...new Set(rows.map((r) => r.post_id))]);
      for (const p of (ps ?? []) as { id: string; title: string }[]) titles.set(p.id, p.title);
      const { data: bs } = await db
        .from("visitor_profiles")
        .select("user_id")
        .eq("blocked", true)
        .in("user_id", [...new Set(rows.map((r) => r.user_id))]);
      for (const b of (bs ?? []) as { user_id: string }[]) blocked.add(b.user_id);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Komentar</h1>
      </div>
      {!db ? (
        <p className="flash flash-error" role="alert">Supabase belum tersambung.</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada komentar.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Komentar</th>
                <th>Tulisan</th>
                <th>
                  <span style={{ position: "absolute", left: -9999 }}>Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={r.hidden ? { opacity: 0.6 } : undefined}>
                  <td>
                    <strong>{r.author_name}</strong>{" "}
                    <span className="note">{formatDateTime(r.created_at)}</span>
                    {r.hidden ? <span className="note"> · disembunyikan</span> : null}
                    <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{r.body}</div>
                  </td>
                  <td>{titles.get(r.post_id) ?? "-"}</td>
                  <td>
                    <div className="row-actions">
                      <form action={setKomentarHidden}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="hidden" value={r.hidden ? "0" : "1"} />
                        <button type="submit" className="link-btn">
                          {r.hidden ? "Tampilkan" : "Sembunyikan"}
                        </button>
                      </form>
                      <form action={setBlocked}>
                        <input type="hidden" name="userId" value={r.user_id} />
                        <input type="hidden" name="blocked" value={blocked.has(r.user_id) ? "0" : "1"} />
                        <button type="submit" className="link-btn">
                          {blocked.has(r.user_id) ? "Buka blokir" : "Blokir"}
                        </button>
                      </form>
                      <form action={deleteKomentar}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton message="Hapus komentar ini?">Hapus</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

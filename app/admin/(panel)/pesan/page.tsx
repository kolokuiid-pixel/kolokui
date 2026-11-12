import Link from "next/link";
import { requireRomo } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { adminGetConversations } from "@/lib/pesan";
import { getDb } from "@/lib/supabase";
import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminPesan() {
  await requireRomo();
  const items = getDb() ? await adminGetConversations() : [];
  return (
    <>
      <AutoRefresh />
      <div className="admin-head">
        <h1 className="page-title">Pesan</h1>
      </div>
      {items.length === 0 ? (
        <p className="empty">Belum ada pesan.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pengunjung</th>
                <th>Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.userId}>
                  <td>
                    <Link href={`/admin/pesan/${c.userId}`} className="t-title">
                      {c.name}
                    </Link>
                    {c.unread ? <span className="badge">baru</span> : null}
                    {c.blocked ? <span className="note"> · diblokir</span> : null}
                  </td>
                  <td>{formatDateTime(c.lastAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

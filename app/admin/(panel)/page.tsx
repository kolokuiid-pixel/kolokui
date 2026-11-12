import Link from "next/link";
import { deletePost } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { adminGetPosts, formatDate } from "@/lib/posts";
import { RUBRIK } from "@/lib/rubrik";
import { getDb } from "@/lib/supabase";
import ConfirmButton from "./ConfirmButton";

const FLASH: Record<string, string> = {
  terbit: "Tulisan sudah terbit.",
  draf: "Tersimpan sebagai draf.",
  hapus: "Tulisan sudah dihapus.",
};

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireAdmin();
  const { ok } = await searchParams;
  const configured = getDb() !== null;
  const posts = configured ? await adminGetPosts() : [];

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Tulisan</h1>
        <Link href="/admin/tulisan/baru" className="btn">
          Tulisan baru
        </Link>
      </div>

      {ok && FLASH[ok] ? <p className="flash">{FLASH[ok]}</p> : null}

      {!configured ? (
        <p className="flash flash-error" role="alert">
          Supabase belum tersambung. Isi NEXT_PUBLIC_SUPABASE_URL dan
          SUPABASE_SERVICE_ROLE_KEY di .env.local, lalu mulai ulang server.
        </p>
      ) : posts.length === 0 ? (
        <p className="empty">Belum ada tulisan. Klik “Tulisan baru” untuk mulai.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Rubrik</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>
                  <span style={{ position: "absolute", left: -9999 }}>Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="t-title">{p.title}</td>
                  <td>{RUBRIK[p.rubrik].label}</td>
                  <td>
                    {p.published ? (
                      <span className="pill pill-live">
                        Terbit{p.featured ? " · Pilihan" : ""}
                      </span>
                    ) : (
                      <span className="pill pill-draft">Draf</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(p.date)}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/tulisan/${p.id}`}>Edit</Link>
                      {p.published ? (
                        <Link
                          href={`/tulisan/${p.rubrik}/${p.slug}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Lihat
                        </Link>
                      ) : null}
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`Hapus “${p.title}”? Ini tidak bisa dibatalkan.`}>
                          Hapus
                        </ConfirmButton>
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

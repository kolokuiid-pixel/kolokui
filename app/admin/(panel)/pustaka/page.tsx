import { deletePustaka } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getPustaka } from "@/lib/posts";
import { getDb } from "@/lib/supabase";
import ConfirmButton from "../ConfirmButton";
import PustakaForm from "./PustakaForm";

export default async function AdminPustaka({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireAdmin();
  const { ok } = await searchParams;
  const configured = getDb() !== null;
  const items = configured ? await getPustaka() : [];

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Pustaka</h1>
      </div>

      {ok === "hapus" ? <p className="flash">Bahan sudah dihapus.</p> : null}

      {!configured ? (
        <p className="flash flash-error" role="alert">
          Supabase belum tersambung. Isi variabel di .env.local, lalu mulai ulang server.
        </p>
      ) : (
        <>
          <section className="panel-box">
            <h2>Tambah bahan</h2>
            <PustakaForm />
          </section>

          {items.length === 0 ? (
            <p className="empty">Belum ada bahan di Pustaka.</p>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Jenis</th>
                    <th>Tahun</th>
                    <th>File</th>
                    <th>
                      <span style={{ position: "absolute", left: -9999 }}>Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="t-title">{it.judul}</td>
                      <td>{it.jenis}</td>
                      <td>{it.tahun}</td>
                      <td>
                        {it.file ? (
                          <a href={it.file}>Unduh</a>
                        ) : (
                          <span className="soft">Belum ada</span>
                        )}
                      </td>
                      <td>
                        <form action={deletePustaka}>
                          <input type="hidden" name="id" value={it.id} />
                          <ConfirmButton message={`Hapus “${it.judul}” beserta filenya?`}>
                            Hapus
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import { getPustaka } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Pustaka",
  description: "Arsip makalah, bahan rekoleksi, dan materi presentasi yang bisa diunduh.",
};

export default function Pustaka() {
  const items = getPustaka();

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Pustaka</h1>
          <p>
            Arsip makalah, bahan rekoleksi, dan materi presentasi yang bisa
            diunduh.
          </p>
        </div>
        <div style={{ paddingBottom: 96 }}>
          {items.length === 0 ? (
            <p className="empty">Belum ada bahan di pustaka.</p>
          ) : (
            items.map((it) => (
              <div key={it.judul} className="pustaka-item">
                <div>
                  <span className="eyebrow">{it.jenis}</span>
                  <div className="post-title">{it.judul}</div>
                  <span className="soft">{it.tahun}</span>
                </div>
                {it.file ? (
                  <a href={it.file} className="btn" download>
                    Unduh
                  </a>
                ) : (
                  <span className="soft">Segera tersedia</span>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

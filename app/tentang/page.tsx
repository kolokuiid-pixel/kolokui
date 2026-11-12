import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { renderMarkdown } from "@/lib/posts";
import { getSiteProfile } from "@/lib/profile";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Profil singkat Romo sebagai imam diosesan dan pendamping orang muda, serta kisah di balik nama Kolokui.",
};

export default async function Tentang() {
  const p = await getSiteProfile();
  const bioHtml = p.bio ? await renderMarkdown(p.bio) : null;
  const kisahHtml = p.kisah ? await renderMarkdown(p.kisah) : null;

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Tentang</h1>
        </div>
        <section className="about-inner" style={{ paddingBottom: 56 }}>
          <div className="photo">
            {p.foto ? <img src={p.foto} alt={p.nama || "Foto Romo"} /> : "[Foto Romo]"}
          </div>
          <div className="about-text">
            <h2 style={{ fontSize: 32 }}>{p.nama || "Romo [Nama lengkap]"}</h2>
            {p.peran ? <p>{p.peran}</p> : null}
            {bioHtml ? (
              <div className="prose" style={{ fontSize: 19 }} dangerouslySetInnerHTML={{ __html: bioHtml }} />
            ) : (
              <p>
                [Profil singkat: imam diosesan di Keuskupan ..., pendamping orang muda sejak
                tahun ...]
              </p>
            )}
          </div>
        </section>
        <section className="article" style={{ paddingTop: 24 }}>
          <h2 className="page-title" style={{ fontSize: 36 }}>
            Kisah di balik nama Kolokui
          </h2>
          {kisahHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: kisahHtml }} />
          ) : (
            <div className="prose">
              <p>
                Kolokui adalah percakapan akrab. Dalam tradisi Ignatian, kolokui adalah cara
                berdoa: berbicara dengan Tuhan seperti seorang sahabat berbicara dengan
                sahabatnya.
              </p>
              <p>[Kisah pribadi Romo tentang kenapa nama ini dipilih.]</p>
            </div>
          )}
          <p style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/pesan" className="btn">
              Kirim pesan ke Romo
            </Link>
            <Link href="/ajak-bercakap" className="btn btn-ghost">
              Ajak Bercakap
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

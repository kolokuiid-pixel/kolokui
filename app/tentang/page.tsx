import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Profil singkat Romo sebagai imam diosesan dan pendamping orang muda, serta kisah di balik nama Kolokui.",
};

export default function Tentang() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Tentang</h1>
        </div>
        <section className="about-inner" style={{ paddingBottom: 56 }}>
          <div className="photo" role="img" aria-label="Tempat foto Romo">
            [Foto Romo]
          </div>
          <div className="about-text">
            <h2 style={{ fontSize: 32 }}>Romo [Nama lengkap]</h2>
            <p>
              [Profil singkat: imam diosesan di Keuskupan ..., pendamping orang
              muda sejak tahun ...]
            </p>
          </div>
        </section>
        <section className="article" style={{ paddingTop: 24 }}>
          <h2 className="page-title" style={{ fontSize: 36 }}>
            Kisah di balik nama Kolokui
          </h2>
          <div className="prose">
            <p>
              Kolokui adalah percakapan akrab. Dalam tradisi Ignatian, kolokui
              adalah cara berdoa: berbicara dengan Tuhan seperti seorang sahabat
              berbicara dengan sahabatnya.
            </p>
            <p>[Kisah pribadi Romo tentang kenapa nama ini dipilih.]</p>
          </div>
          <p style={{ marginTop: 32 }}>
            <Link href="/ajak-bercakap" className="btn">
              Ajak Bercakap
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

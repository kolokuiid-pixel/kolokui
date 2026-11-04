import Link from "next/link";
import Header from "@/components/Header";
import PostList from "@/components/PostList";
import { getPosts } from "@/lib/posts";
import { RUBRIK, RUBRIK_SLUGS } from "@/lib/rubrik";

export default function Home() {
  const latest = getPosts().slice(0, 6);

  return (
    <>
      <div className="hero">
        <Header />
        <div className="wrap hero-body">
          <h1>Kolokui</h1>
          <p className="tagline">Percakapan dengan Tuhan, sesama, dan hidup</p>
          <p className="lead">
            Kolokui berarti percakapan akrab, seperti dua sahabat yang duduk
            berhadapan dan saling mendengarkan. Dalam spiritualitas Ignatian,
            begitulah doa dijalani. Tulisan-tulisan di sini lahir dari
            percakapan itu: dengan Tuhan, dengan sesama, dan dengan hidup
            sehari-hari.
          </p>
        </div>
      </div>

      <main>
        <section className="wrap section">
          <h2>Empat ruang percakapan</h2>
          <div className="cards">
            {RUBRIK_SLUGS.map((slug) => (
              <Link key={slug} href={`/tulisan/${slug}`} className="card">
                <span className="eyebrow">{RUBRIK[slug].label}</span>
                <span className="card-title">{RUBRIK[slug].judul}</span>
                <p>{RUBRIK[slug].deskripsi}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="wrap section">
          <h2>Tulisan terbaru</h2>
          <PostList posts={latest} />
        </section>

        <section className="about">
          <div className="wrap about-inner">
            <div className="photo" role="img" aria-label="Tempat foto Romo">
              [Foto Romo]
            </div>
            <div className="about-text">
              <h2>Tentang Romo</h2>
              <p>
                Imam diosesan dan pendamping orang muda. Di halaman ini, Romo
                bercerita tentang panggilannya dan tentang kisah di balik nama
                Kolokui.
              </p>
              <Link href="/tentang" style={{ fontWeight: 600 }}>
                Baca selengkapnya
              </Link>
            </div>
          </div>
        </section>

        <section className="wrap cta">
          <Link href="/pustaka" className="cta-card cta-outline">
            <span className="card-title">Pustaka</span>
            <p>
              Arsip makalah, bahan rekoleksi, dan materi presentasi yang bisa
              diunduh.
            </p>
          </Link>
          <Link href="/ajak-bercakap" className="cta-card cta-solid">
            <span className="card-title">Ajak Bercakap</span>
            <p>
              Kontak dan formulir undangan untuk rekoleksi, retret, atau
              narasumber.
            </p>
          </Link>
        </section>
      </main>
    </>
  );
}

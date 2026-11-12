import Link from "next/link";
import { formatDate, type Post } from "@/lib/posts";
import { RUBRIK } from "@/lib/rubrik";

const href = (p: Post) => `/tulisan/${p.rubrik}/${p.slug}`;

/** Kartu tulisan: foto di atas, label rubrik, judul, tanggal, ringkasan. */
export function PostCards({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="empty">Belum ada tulisan di sini.</p>;
  }
  return (
    <div className="pcards">
      {posts.map((p) => (
        <article key={p.id} className="pcard">
          <Link href={href(p)} className="pcard-img" tabIndex={-1} aria-hidden="true">
            {p.cover ? <img src={p.cover} alt="" loading="lazy" /> : <span className="pcard-ph" />}
          </Link>
          <div className="pcard-body">
            <span className="badge-rubrik">{RUBRIK[p.rubrik].label}</span>
            <h3 className="pcard-title">
              <Link href={href(p)}>{p.title}</Link>
            </h3>
            <p className="pcard-meta">{formatDate(p.date)}</p>
            {p.excerpt ? <p className="pcard-excerpt">{p.excerpt}</p> : null}
            <Link href={href(p)} className="pcard-more">
              Baca selengkapnya
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Bagian Pilihan: gambar besar, label, judul huruf kapital di tengah. */
export function FeaturedCards({ posts }: { posts: Post[] }) {
  return (
    <div className="fcards">
      {posts.map((p) => (
        <Link key={p.id} href={href(p)} className="fcard">
          <span className="fcard-img">
            {p.cover ? <img src={p.cover} alt="" loading="lazy" /> : <span className="pcard-ph" />}
          </span>
          <span className="badge-rubrik">{RUBRIK[p.rubrik].label}</span>
          <span className="fcard-title">{p.title}</span>
        </Link>
      ))}
    </div>
  );
}

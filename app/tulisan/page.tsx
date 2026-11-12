import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PostList from "@/components/PostList";
import { getPosts } from "@/lib/posts";
import { RUBRIK, RUBRIK_SLUGS } from "@/lib/rubrik";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tulisan",
  description:
    "Semua tulisan Kolokui dari empat rubrik: Senja, Sabda, OMK, dan Ziarah.",
};

export default async function Tulisan() {
  const posts = await getPosts();

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Tulisan</h1>
          <p>Semua tulisan dari empat ruang percakapan, yang terbaru di atas.</p>
        </div>
        <nav className="filters" aria-label="Rubrik">
          <Link href="/tulisan" aria-current="page">
            Semua
          </Link>
          {RUBRIK_SLUGS.map((s) => (
            <Link key={s} href={`/tulisan/${s}`}>
              {RUBRIK[s].label}
            </Link>
          ))}
        </nav>
        <PostList posts={posts} />
      </main>
    </>
  );
}

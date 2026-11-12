import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PostList from "@/components/PostList";
import { getPosts } from "@/lib/posts";
import { RUBRIK, RUBRIK_SLUGS, isRubrik } from "@/lib/rubrik";

export const revalidate = 60;

type Props = { params: Promise<{ rubrik: string }> };

export function generateStaticParams() {
  return RUBRIK_SLUGS.map((rubrik) => ({ rubrik }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubrik } = await params;
  if (!isRubrik(rubrik)) return {};
  return { title: RUBRIK[rubrik].nama, description: RUBRIK[rubrik].deskripsi };
}

export default async function RubrikPage({ params }: Props) {
  const { rubrik } = await params;
  if (!isRubrik(rubrik)) notFound();
  const posts = await getPosts(rubrik);

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <span className="eyebrow">Rubrik</span>
          <h1 className="page-title">{RUBRIK[rubrik].nama}</h1>
          <p>{RUBRIK[rubrik].deskripsi}</p>
        </div>
        <nav className="filters" aria-label="Rubrik">
          <Link href="/tulisan">Semua</Link>
          {RUBRIK_SLUGS.map((s) => (
            <Link
              key={s}
              href={`/tulisan/${s}`}
              aria-current={s === rubrik ? "page" : undefined}
            >
              {RUBRIK[s].label}
            </Link>
          ))}
        </nav>
        <PostList posts={posts} />
      </main>
    </>
  );
}

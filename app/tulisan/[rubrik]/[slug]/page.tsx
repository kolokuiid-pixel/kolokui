import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { formatDate, getPost, getPosts } from "@/lib/posts";
import { RUBRIK, isRubrik } from "@/lib/rubrik";

type Props = { params: Promise<{ rubrik: string; slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ rubrik: p.rubrik, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubrik, slug } = await params;
  if (!isRubrik(rubrik)) return {};
  const post = await getPost(rubrik, slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function PostPage({ params }: Props) {
  const { rubrik, slug } = await params;
  if (!isRubrik(rubrik)) notFound();
  const post = await getPost(rubrik, slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="wrap">
        <article className="article">
          <Link href={`/tulisan/${rubrik}`} className="eyebrow">
            {RUBRIK[rubrik].nama}
          </Link>
          <h1>{post.title}</h1>
          <p className="meta">{formatDate(post.date)}</p>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
    </>
  );
}

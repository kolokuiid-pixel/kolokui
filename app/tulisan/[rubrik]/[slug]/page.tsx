import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Komentar from "@/components/Komentar";
import { formatDate, getPost } from "@/lib/posts";
import { RUBRIK, isRubrik } from "@/lib/rubrik";

// Tulisan baru dibuat saat pertama dibuka, lalu di-cache. Admin menyegarkan cache saat menyimpan.
export const revalidate = 60;

type Props = { params: Promise<{ rubrik: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubrik, slug } = await params;
  if (!isRubrik(rubrik)) return {};
  const post = await getPost(rubrik, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    // Foto sampul jadi gambar pratinjau saat tautan dibagikan (WhatsApp, dll).
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover ? [post.cover] : undefined,
    },
  };
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
          {post.cover ? <img src={post.cover} alt="" className="cover" /> : null}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
        <Komentar postId={post.id} path={`/tulisan/${rubrik}/${slug}`} />
      </main>
    </>
  );
}

import Link from "next/link";
import { formatDate, type Post } from "@/lib/posts";
import { RUBRIK } from "@/lib/rubrik";

export default function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="empty">Belum ada tulisan di sini.</p>;
  }

  return (
    <div className="posts">
      {posts.map((p) => (
        <Link
          key={`${p.rubrik}/${p.slug}`}
          href={`/tulisan/${p.rubrik}/${p.slug}`}
          className="post-row"
        >
          <span className="eyebrow">{RUBRIK[p.rubrik].label}</span>
          <span className="post-main">
            <span className="post-title">{p.title}</span>
            {p.excerpt ? <p className="post-excerpt">{p.excerpt}</p> : null}
          </span>
          <span className="post-date">{formatDate(p.date)}</span>
        </Link>
      ))}
    </div>
  );
}

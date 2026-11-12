"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatDateTime } from "@/lib/format";
import { authFetch, useVisitor } from "@/lib/visitor-client";

type Comment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export default function Komentar({ postId, path }: { postId: string; path: string }) {
  const visitor = useVisitor();
  const userId = visitor.user?.id ?? null;
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await authFetch(`/api/komentar?post=${postId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat komentar.");
      setComments(data.comments as Comment[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat komentar.");
      setComments([]);
    }
  }, [postId]);

  // Muat ulang saat status login berubah supaya komentar sendiri bisa ditandai.
  useEffect(() => {
    if (!visitor.loading) void load();
  }, [visitor.loading, userId, load]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setPosting(true);
    setError(null);
    try {
      const res = await authFetch("/api/komentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Komentar gagal dikirim.");
      setComments((prev) => [...(prev ?? []), data.comment as Comment]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Komentar gagal dikirim.");
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus komentarmu?")) return;
    const res = await authFetch(`/api/komentar?id=${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => (prev ?? []).filter((c) => c.id !== id));
    else setError("Gagal menghapus komentar.");
  }

  return (
    <section className="comments" aria-labelledby="komentar-judul">
      <h2 id="komentar-judul">
        Komentar{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {comments === null ? (
        <p className="soft">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="soft">Belum ada komentar. Jadilah yang pertama.</p>
      ) : (
        <div>
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-head">
                <span className="comment-name">{c.name}</span>
                <span className="comment-time">{formatDateTime(c.createdAt)}</span>
                {c.mine ? (
                  <button type="button" className="link-btn" onClick={() => remove(c.id)}>
                    Hapus
                  </button>
                ) : null}
              </div>
              <p className="comment-body">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p className="flash flash-error" role="alert" style={{ marginTop: 20 }}>
          {error}
        </p>
      ) : null}

      {visitor.loading ? null : !visitor.configured ? null : visitor.user ? (
        <form className="comment-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="komentar-isi">Tulis komentar</label>
            <textarea
              id="komentar-isi"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              required
              style={{ minHeight: 110 }}
            />
          </div>
          <div>
            <button type="submit" className="btn" disabled={posting}>
              {posting ? "Mengirim..." : "Kirim komentar"}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ marginTop: 24 }}>
          <Link href={`/masuk?next=${encodeURIComponent(path)}`} className="btn">
            Masuk untuk berkomentar
          </Link>
        </p>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { formatDateTime } from "@/lib/format";
import { authFetch, useVisitor } from "@/lib/visitor-client";

type Msg = { id: string; from: "user" | "romo"; body: string; createdAt: string };

const POLL_MS = 15000;

export default function PesanClient() {
  const visitor = useVisitor();
  const userId = visitor.user?.id ?? null;
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/pesan");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat pesan.");
      setMessages(data.messages as Msg[]);
      setBlocked(Boolean(data.blocked));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesan.");
      setMessages((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    void load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [userId, load]);

  // Gulir ke pesan terbaru hanya saat jumlah pesan bertambah.
  useEffect(() => {
    const n = messages?.length ?? 0;
    if (n > lastCount.current) {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    lastCount.current = n;
  }, [messages]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const res = await authFetch("/api/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pesan gagal terkirim.");
      setMessages((prev) => [...(prev ?? []), data.message as Msg]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pesan gagal terkirim.");
    } finally {
      setSending(false);
    }
  }

  if (visitor.loading) return <p className="soft">Sebentar ya...</p>;

  if (!visitor.configured) {
    return (
      <p className="flash flash-error" role="alert">
        Pesan belum diatur di server.
      </p>
    );
  }

  if (!visitor.user) {
    return (
      <div className="auth-box">
        <p>Masuk dulu supaya Romo tahu siapa yang menulis dan bisa membalas.</p>
        <p>
          <Link href="/masuk?next=/pesan" className="btn">
            Masuk
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef} aria-live="polite" aria-label="Percakapan dengan Romo">
        {messages === null ? (
          <p className="soft">Memuat pesan...</p>
        ) : messages.length === 0 ? (
          <p className="soft">Belum ada pesan. Tulis pesan pertamamu untuk Romo di bawah.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bubble ${m.from === "user" ? "bubble-me" : "bubble-romo"}`}>
              {m.from === "romo" ? <strong>Romo</strong> : null}
              {m.from === "romo" ? <br /> : null}
              {m.body}
              <span className="bubble-time">{formatDateTime(m.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      {blocked ? (
        <p className="flash flash-error" role="alert">
          Akunmu tidak bisa mengirim pesan.
        </p>
      ) : (
        <form className="comment-form" onSubmit={send}>
          <div className="field">
            <label htmlFor="pesan-isi">Pesanmu</label>
            <textarea
              id="pesan-isi"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4000}
              required
              style={{ minHeight: 110 }}
            />
          </div>
          <div>
            <button type="submit" className="btn" disabled={sending}>
              {sending ? "Mengirim..." : "Kirim pesan"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p className="flash flash-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

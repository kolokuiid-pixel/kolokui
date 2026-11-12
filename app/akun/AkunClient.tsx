"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { authFetch, useVisitor } from "@/lib/visitor-client";

export default function AkunClient() {
  const router = useRouter();
  const visitor = useVisitor();
  const userId = visitor.user?.id ?? null;
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    authFetch("/api/akun")
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setName(d.name);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [userId]);

  if (visitor.loading) return <p className="soft">Sebentar ya...</p>;

  if (!visitor.user) {
    return (
      <div className="auth-box">
        <p>Kamu belum masuk.</p>
        <p>
          <Link href="/masuk?next=/akun" className="btn">
            Masuk
          </Link>
        </p>
      </div>
    );
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authFetch("/api/akun", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan.");
      setName(data.name);
      setMessage("Nama tersimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await getBrowserClient()?.auth.signOut();
    router.push("/");
  }

  return (
    <div className="auth-box">
      <p className="soft" style={{ margin: 0 }}>
        Masuk sebagai {visitor.user.email}
      </p>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="nama">Nama yang tampil di komentar dan pesan</label>
          <input
            id="nama"
            required
            minLength={2}
            maxLength={60}
            value={name}
            disabled={!loaded}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" className="btn" disabled={saving || !loaded}>
            {saving ? "Menyimpan..." : "Simpan nama"}
          </button>
        </div>
      </form>

      {message ? <p className="flash" role="status" style={{ margin: 0 }}>{message}</p> : null}
      {error ? (
        <p className="flash flash-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}

      <p style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: 0 }}>
        <Link href="/pesan" className="btn btn-ghost">
          Pesan ke Romo
        </Link>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Keluar
        </button>
      </p>
    </div>
  );
}

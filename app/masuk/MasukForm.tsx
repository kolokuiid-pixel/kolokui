"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { NEXT_KEY, safeNext, useVisitor } from "@/lib/visitor-client";

const MIN_PASSWORD = 8;

function rememberNext(): string {
  const next = safeNext(new URLSearchParams(window.location.search).get("next"));
  try {
    localStorage.setItem(NEXT_KEY, next);
  } catch {
    /* penyimpanan browser diblokir: setelah login akan ke halaman Akun */
  }
  return next;
}

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email atau password salah.";
  if (/email not confirmed/i.test(message)) {
    return "Emailmu belum dikonfirmasi. Cek emailmu dan klik tautan konfirmasinya.";
  }
  if (/rate limit|too many/i.test(message)) {
    return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  }
  if (/password should be|at least/i.test(message)) {
    return `Password minimal ${MIN_PASSWORD} karakter.`;
  }
  return message;
}

export default function MasukForm() {
  const visitor = useVisitor();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visitor.loading && !visitor.configured) {
    return (
      <p className="flash flash-error" role="alert">
        Login belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  if (visitor.user) {
    return (
      <div className="auth-box">
        <p className="flash">Kamu sudah masuk sebagai {visitor.user.email ?? "pengunjung"}.</p>
        <p style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/pesan" className="btn">
            Pesan ke Romo
          </Link>
          <Link href="/akun" className="btn btn-ghost">
            Akunku
          </Link>
        </p>
      </div>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sb = getBrowserClient();
    if (!sb) return;
    setError(null);

    if (mode === "daftar") {
      if (password.length < MIN_PASSWORD) {
        setError(`Password minimal ${MIN_PASSWORD} karakter.`);
        return;
      }
      if (!setuju) {
        setError("Centang persetujuan Syarat dan Ketentuan serta Kebijakan Privasi dulu.");
        return;
      }
    }

    setBusy(true);
    const next = rememberNext();

    if (mode === "masuk") {
      const { error: err } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (err) setError(friendly(err.message));
      else window.location.assign(next);
      return;
    }

    const { data, error: err } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: { full_name: nama.trim() || undefined, terms_accepted_at: new Date().toISOString() },
      },
    });
    setBusy(false);
    if (err) {
      setError(friendly(err.message));
      return;
    }
    // Kalau konfirmasi email dimatikan di Supabase, sesi langsung ada.
    if (data.session) window.location.assign(next);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-box">
        <p className="flash" role="status">
          Hampir selesai. Kami mengirim email konfirmasi ke {email}. Klik tautan di email itu
          untuk mengaktifkan akunmu. Kalau belum ada, cek folder spam.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <div style={{ display: "flex", gap: 8 }} role="tablist" aria-label="Masuk atau daftar">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "masuk"}
          className={mode === "masuk" ? "btn" : "btn btn-ghost"}
          onClick={() => {
            setMode("masuk");
            setError(null);
          }}
        >
          Masuk
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "daftar"}
          className={mode === "daftar" ? "btn" : "btn btn-ghost"}
          onClick={() => {
            setMode("daftar");
            setError(null);
          }}
        >
          Daftar
        </button>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "daftar" ? (
          <div className="field">
            <label htmlFor="nama">Nama yang tampil di komentar</label>
            <input
              id="nama"
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={mode === "daftar" ? MIN_PASSWORD : undefined}
            autoComplete={mode === "daftar" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "daftar" ? (
            <span className="note">Minimal {MIN_PASSWORD} karakter.</span>
          ) : null}
        </div>

        {mode === "daftar" ? (
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              style={{ width: "auto", marginTop: 4 }}
            />
            <span>
              Saya setuju dengan{" "}
              <Link href="/syarat" target="_blank" style={{ textDecoration: "underline" }}>
                Syarat dan Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="/privasi" target="_blank" style={{ textDecoration: "underline" }}>
                Kebijakan Privasi
              </Link>
              .
            </span>
          </label>
        ) : null}

        <div>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Sebentar..." : mode === "masuk" ? "Masuk" : "Buat akun"}
          </button>
        </div>
        {mode === "masuk" ? (
          <p style={{ margin: 0, fontSize: 15 }}>
            <Link href="/lupa-password" style={{ textDecoration: "underline" }}>
              Lupa password?
            </Link>
          </p>
        ) : null}
      </form>

      {error ? (
        <p className="flash flash-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

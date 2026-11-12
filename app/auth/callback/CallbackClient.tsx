"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { NEXT_KEY, safeNext } from "@/lib/visitor-client";

/** Tujuan setelah login Google: menukar kode dari Supabase menjadi sesi di browser ini. */
export default function CallbackClient() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return; // kode login hanya bisa dipakai sekali
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const providerError = params.get("error_description") ?? params.get("error");
    const code = params.get("code");
    const sb = getBrowserClient();

    if (providerError) {
      setError(providerError);
      return;
    }
    if (!sb || !code) {
      setError("Tautan login tidak lengkap. Coba masuk lagi.");
      return;
    }

    sb.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      let next = "/akun";
      try {
        next = safeNext(localStorage.getItem(NEXT_KEY));
        localStorage.removeItem(NEXT_KEY);
      } catch {
        /* abaikan */
      }
      router.replace(next);
    });
  }, [router]);

  if (error) {
    return (
      <div className="auth-box">
        <p className="flash flash-error" role="alert">
          Login gagal: {error}
        </p>
        <p>
          <Link href="/masuk" className="btn">
            Coba lagi
          </Link>
        </p>
      </div>
    );
  }
  return <p className="soft">Sebentar ya...</p>;
}

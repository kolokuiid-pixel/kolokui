"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { NEXT_KEY, safeNext } from "@/lib/visitor-client";

type OtpType = "email" | "magiclink" | "signup";

/**
 * Tujuan tautan di email. Memakai token_hash (bukan kode PKCE) supaya tautan tetap jalan
 * walau dibuka di aplikasi email atau browser lain di HP.
 */
export default function ConfirmClient() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const rawType = params.get("type");
    const type: OtpType =
      rawType === "magiclink" || rawType === "signup" ? rawType : "email";
    const sb = getBrowserClient();

    if (!sb || !tokenHash) {
      setError("Tautan login tidak lengkap. Minta tautan baru.");
      return;
    }

    sb.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error: err }) => {
      if (err) {
        setError(
          /expired|invalid/i.test(err.message)
            ? "Tautannya sudah kedaluwarsa atau sudah dipakai. Minta tautan baru."
            : err.message,
        );
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
          {error}
        </p>
        <p>
          <Link href="/masuk" className="btn">
            Minta tautan baru
          </Link>
        </p>
      </div>
    );
  }
  return <p className="soft">Sebentar ya...</p>;
}

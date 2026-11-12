"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authFetch, useVisitor } from "@/lib/visitor-client";

/** Tautan "Pesan" dan "Masuk/Akun" di menu atas, plus titik kalau Romo membalas. */
export default function VisitorNav() {
  const pathname = usePathname();
  const visitor = useVisitor();
  const userId = visitor.user?.id ?? null;
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUnread(false);
      return;
    }
    let alive = true;
    authFetch("/api/pesan?peek=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setUnread(Boolean(d.unread));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [userId, pathname]);

  return (
    <>
      <Link href="/pesan" aria-current={pathname.startsWith("/pesan") ? "page" : undefined}>
        Pesan
        {unread ? (
          <span className="dot" role="img" aria-label="ada balasan baru dari Romo" />
        ) : null}
      </Link>
      {visitor.loading ? null : visitor.user ? (
        <Link href="/akun" aria-current={pathname.startsWith("/akun") ? "page" : undefined}>
          Akun
        </Link>
      ) : (
        <Link href="/masuk" aria-current={pathname.startsWith("/masuk") ? "page" : undefined}>
          Masuk
        </Link>
      )}
    </>
  );
}

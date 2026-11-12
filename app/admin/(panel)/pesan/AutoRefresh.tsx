"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Menyegarkan data halaman tiap 30 detik selama tab terlihat. */
export default function AutoRefresh({ ms = 30000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}

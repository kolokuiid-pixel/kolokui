"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

type Props = { role: "admin" | "romo"; unread: number };

export default function AdminNav({ role, unread }: Props) {
  const pathname = usePathname();
  const on = (p: string) => pathname.startsWith(p);
  const onTulisan = pathname === "/admin" || on("/admin/tulisan");

  return (
    <div className="admin-bar">
      <Link href="/admin" className="logo">
        Kolokui Admin
      </Link>
      <nav aria-label="Menu admin">
        <Link href="/admin" aria-current={onTulisan ? "page" : undefined}>
          Tulisan
        </Link>
        <Link href="/admin/komentar" aria-current={on("/admin/komentar") ? "page" : undefined}>
          Komentar
        </Link>
        {role === "romo" ? (
          <Link href="/admin/pesan" aria-current={on("/admin/pesan") ? "page" : undefined}>
            Pesan{unread > 0 ? <span className="badge">{unread}</span> : null}
          </Link>
        ) : null}
        <Link href="/admin/profil" aria-current={on("/admin/profil") ? "page" : undefined}>
          Profil
        </Link>
        <Link href="/admin/pustaka" aria-current={on("/admin/pustaka") ? "page" : undefined}>
          Pustaka
        </Link>
        <Link href="/" target="_blank" rel="noopener">
          Lihat situs
        </Link>
        <form action={logout}>
          <button type="submit" className="link-btn">
            Keluar
          </button>
        </form>
      </nav>
    </div>
  );
}

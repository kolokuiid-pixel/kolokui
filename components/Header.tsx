"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tulisan", label: "Tulisan" },
  { href: "/tentang", label: "Tentang" },
  { href: "/pustaka", label: "Pustaka" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="wrap site-header">
      <Link href="/" className="logo">
        Kolokui
      </Link>
      <nav className="nav" aria-label="Menu utama">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/ajak-bercakap" className="btn">
          Ajak Bercakap
        </Link>
      </nav>
    </header>
  );
}

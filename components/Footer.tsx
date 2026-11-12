"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="wrap">
      <footer className="site-footer">
        <span className="logo">Kolokui</span>
        <span>
          © {new Date().getFullYear()} Kolokui. Percakapan dengan Tuhan,
          sesama, dan hidup.
        </span>
      </footer>
    </div>
  );
}

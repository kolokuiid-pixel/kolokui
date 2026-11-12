import type { Metadata } from "next";
import Header from "@/components/Header";
import PesanClient from "./PesanClient";

export const metadata: Metadata = {
  title: "Pesan ke Romo",
  robots: { index: false, follow: false },
};

export default function PesanPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Pesan ke Romo</h1>
          <p>
            Tulis apa saja yang ingin kamu sampaikan. Romo membalas ketika sempat,
            jadi balasannya bisa memakan waktu beberapa hari. Untuk hal yang
            mendesak, hubungi pastor paroki atau layanan darurat, bukan lewat pesan ini.
          </p>
        </div>
        <PesanClient />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import MasukForm from "./MasukForm";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default function MasukPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Masuk</h1>
          <p>Masuk untuk berkomentar di tulisan dan mengirim pesan kepada Romo.</p>
        </div>
        <MasukForm />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import UndanganForm from "./UndanganForm";

export const metadata: Metadata = {
  title: "Ajak Bercakap",
  description: "Kontak dan formulir undangan untuk rekoleksi, retret, atau narasumber.",
};

export default function AjakBercakap() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Ajak Bercakap</h1>
          <p>
            Untuk undangan rekoleksi, retret, atau narasumber, isi formulir di
            bawah ini.
          </p>
        </div>
        <UndanganForm />
      </main>
    </>
  );
}

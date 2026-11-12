import type { Metadata } from "next";
import Header from "@/components/Header";
import ConfirmClient from "./ConfirmClient";

export const metadata: Metadata = {
  title: "Memproses login",
  robots: { index: false, follow: false },
};

export default function ConfirmPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Memproses login</h1>
        </div>
        <ConfirmClient />
      </main>
    </>
  );
}

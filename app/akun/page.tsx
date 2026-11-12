import type { Metadata } from "next";
import Header from "@/components/Header";
import AkunClient from "./AkunClient";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

export default function AkunPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1 className="page-title">Akunku</h1>
        </div>
        <AkunClient />
      </main>
    </>
  );
}

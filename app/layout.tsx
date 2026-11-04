import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kolokui | Percakapan dengan Tuhan, sesama, dan hidup",
    template: "%s | Kolokui",
  },
  description:
    "Renungan, homili, dan bahan pendampingan orang muda dari seorang imam diosesan. Percakapan dengan Tuhan, sesama, dan hidup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}

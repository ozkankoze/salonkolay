import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { siteKoku } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteKoku()),
  title: {
    default: "Salonkolay — salonunuz için randevu sayfası",
    template: "%s · Salonkolay",
  },
  description:
    "Müşteriniz saatini kendi seçsin, randevu size düşsün. Instagram bio'nuza koyacağınız randevu sayfası.",
  openGraph: { type: "website", locale: "tr_TR", siteName: "Salonkolay" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={outfit.variable}>
      <body style={{ fontFamily: "var(--font-outfit), ui-sans-serif, system-ui" }}>{children}</body>
    </html>
  );
}

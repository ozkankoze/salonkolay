import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { siteKoku } from "@/lib/site";
import { DIL_CEREZI, dilAyikla } from "@/lib/dil";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Sayfanın dilini çerezden okuyoruz: ekran okuyucular ve tarayıcı
  // çevirisi doğru dili görsün. Adresteki ?dil=en de çereze yazılıyor.
  const dil = dilAyikla((await cookies()).get(DIL_CEREZI)?.value) ?? "tr";

  return (
    <html lang={dil} className={outfit.variable}>
      <body style={{ fontFamily: "var(--font-outfit), ui-sans-serif, system-ui" }}>{children}</body>
    </html>
  );
}

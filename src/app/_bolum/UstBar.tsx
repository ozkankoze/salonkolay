"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dil, Sozluk } from "@/lib/dil";
import { dilliAdres } from "@/lib/dil";
import Logo from "./Logo";
import DilDugmesi from "../DilDugmesi";

/**
 * SABİT ÜST BAR
 *
 * Sayfanın en üstündeyken zeminsiz duruyor — hero görselinin üstüne
 * ikinci bir şerit binmesin diye. Kaydırma başlayınca bulanık cam
 * zemin ve ince bir çizgi beliriyor.
 *
 * ⚠️ Mobil menü `position: fixed` bir katman. Gövdenin kaydırması
 * menü açıkken kilitleniyor; yoksa arkadaki sayfa menünün altında
 * kayıyor ve kapatınca insan nerede olduğunu şaşırıyor.
 */
export default function UstBar({
  dil,
  t,
  ton = "koyu",
}: {
  dil: Dil;
  t: Sozluk;
  /** Hero koyu zeminliyse "acik" — yazılar beyaz başlar. */
  ton?: "koyu" | "acik";
}) {
  const [kaydi, setKaydi] = useState(false);
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    const bak = () => setKaydi(window.scrollY > 12);
    bak();
    window.addEventListener("scroll", bak, { passive: true });
    return () => window.removeEventListener("scroll", bak);
  }, []);

  useEffect(() => {
    document.body.style.overflow = acik ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [acik]);

  const a = (yol: string) => dilliAdres(yol, dil);

  const orta: [string, string][] = [
    [t.pKesfet, a("/kesfet")],
    [t.pKategoriler, a("/kesfet#kategoriler")],
    [t.pNasil, a("/#nasil")],
  ];

  const acikTon = ton === "acik" && !kaydi;
  const yaziRengi = acikTon ? "text-white/90" : "text-p-gri";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
          kaydi
            ? "border-b border-p-cizgi bg-p-zemin/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1180px] items-center gap-6 px-5 sm:px-7">
          <Link href={a("/")} className="p-odak shrink-0" aria-label="Salonkolay">
            <Logo ton={acikTon ? "acik" : "koyu"} />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {orta.map(([ad, yol]) => (
              <Link
                key={ad}
                href={yol}
                className={`p-odak text-[15px] font-medium transition-colors hover:text-p-vurgu ${yaziRengi}`}
              >
                {ad}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href={a("/salon-ekle")}
              className={`p-odak rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                acikTon ? "text-white/90 hover:text-white" : "text-p-gri hover:text-p-vurgu"
              }`}
            >
              {t.pSalonEkle}
            </Link>
            <span className={acikTon ? "text-white" : "text-p-murekkep"}>
              <DilDugmesi dil={dil} />
            </span>
            <Link
              href="/panel"
              className="p-odak rounded-full bg-p-murekkep px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-p-vurgu2"
            >
              {t.pGiris}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setAcik(true)}
            aria-label={t.pMenu}
            className={`p-odak ml-auto grid h-10 w-10 place-items-center rounded-full md:hidden ${
              acikTon ? "text-white" : "text-p-murekkep"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
      </header>

      {acik && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-p-zemin md:hidden">
          <div className="flex h-[68px] items-center justify-between px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setAcik(false)}
              aria-label={t.pKapat}
              className="p-odak grid h-10 w-10 place-items-center rounded-full text-p-murekkep"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-5 pt-4">
            {orta.map(([ad, yol]) => (
              <Link
                key={ad}
                href={yol}
                onClick={() => setAcik(false)}
                className="p-baslik p-odak border-b border-p-cizgi py-4 text-[26px] text-p-murekkep"
              >
                {ad}
              </Link>
            ))}
            <Link
              href={a("/salon-ekle")}
              onClick={() => setAcik(false)}
              className="p-baslik p-odak border-b border-p-cizgi py-4 text-[26px] text-p-murekkep"
            >
              {t.pSalonEkle}
            </Link>
          </nav>

          <div className="mt-auto flex items-center gap-3 px-5 pb-8">
            <Link
              href="/panel"
              className="p-odak flex-1 rounded-full bg-p-murekkep px-6 py-4 text-center text-[16px] font-medium text-white"
            >
              {t.pGiris}
            </Link>
            <DilDugmesi dil={dil} />
          </div>
        </div>
      )}
    </>
  );
}

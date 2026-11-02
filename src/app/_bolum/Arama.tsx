"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dil, Sozluk } from "@/lib/dil";
import { dilliAdres } from "@/lib/dil";

/**
 * ARAMA ALANI
 *
 * Hero'nun ve keşfet sayfasının ortak arama kutusu. Gönderince
 * /kesfet adresine sorgu olarak gidiyor — yani arama gerçekten
 * çalışıyor, süs değil.
 *
 * ⚠️ KONUM LİSTESİ UYDURULMUYOR. Seçenekler sistemdeki salonların
 * adreslerinden çıkıyor; olmayan şehirleri listelemek, orada salon
 * varmış izlenimi verirdi.
 */
export default function Arama({
  dil,
  t,
  sehirler,
  baslangic,
  boyut = "buyuk",
}: {
  dil: Dil;
  t: Sozluk;
  sehirler: string[];
  baslangic?: { metin?: string; yer?: string };
  boyut?: "buyuk" | "orta";
}) {
  const router = useRouter();
  const [metin, setMetin] = useState(baslangic?.metin ?? "");
  const [yer, setYer] = useState(baslangic?.yer ?? "");

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (metin.trim()) p.set("q", metin.trim());
    if (yer) p.set("yer", yer);
    const sorgu = p.toString();
    router.push(dilliAdres("/kesfet" + (sorgu ? `?${sorgu}` : ""), dil));
  }

  const yuk = boyut === "buyuk" ? "sm:h-[72px]" : "sm:h-[62px]";

  return (
    <form
      onSubmit={gonder}
      className={`flex w-full flex-col gap-2 rounded-[26px] border border-p-cizgi bg-p-kart p-2 shadow-[0_24px_60px_-34px_rgba(26,25,23,.5)] sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:p-1.5 ${yuk}`}
    >
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 sm:rounded-full sm:py-0">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-p-silik" aria-hidden>
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="sr-only">{t.pAramaHizmet}</span>
        <input
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          placeholder={t.pAramaHizmetYer}
          className="w-full bg-transparent text-[16px] text-p-murekkep placeholder:text-p-silik focus:outline-none"
        />
      </label>

      <span aria-hidden className="mx-2 hidden w-px self-center bg-p-cizgi sm:block sm:h-8" />

      <label className="flex items-center gap-3 rounded-2xl px-4 py-3 sm:min-w-[172px] sm:rounded-full sm:py-0">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-p-silik" aria-hidden>
          <path
            d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="sr-only">{t.pAramaKonum}</span>
        <select
          value={yer}
          onChange={(e) => setYer(e.target.value)}
          className="w-full appearance-none bg-transparent text-[16px] text-p-murekkep focus:outline-none"
        >
          <option value="">{t.pAramaKonumHepsi}</option>
          {sehirler.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="p-odak rounded-2xl bg-p-vurgu px-7 py-4 text-[16px] font-medium text-white transition-colors hover:bg-p-vurgu2 sm:rounded-full sm:py-0"
      >
        {t.pAramaDugme}
      </button>
    </form>
  );
}

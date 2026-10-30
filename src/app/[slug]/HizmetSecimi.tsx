"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Hizmet } from "@/lib/salon";
import {
  type Dil,
  type Sozluk,
  doldur,
  fiyatYazDil,
  sec,
  sureYazDil,
} from "@/lib/dil";

/**
 * SALON SAYFASINDA HİZMET SEÇİMİ
 *
 * Ziyaretçi fiyat listesine bakarken zaten "şunu ve şunu yaptıracağım"
 * diye düşünüyor. O kararı burada alabilsin, randevu ekranında baştan
 * seçmek zorunda kalmasın: seçim adrese yazılıp (?h=h1,h2) randevu
 * akışına taşınıyor.
 *
 * Alttaki çubuk aynı zamanda mobilin sabit "Randevu Al" düğmesi:
 * seçim yokken tek başına randevuya götürür, seçim varken özet gösterir.
 * İki ayrı çubuk koymaktansa biri iki işi yapıyor.
 */

type Grup = { grup: string; baslik: string; hizmetler: Hizmet[] };

export default function HizmetSecimi({
  gruplar,
  slug,
  telefon,
  dil,
  t,
  renk,
  koyu,
  acikZemin,
}: {
  gruplar: Grup[];
  slug: string;
  telefon: string;
  dil: Dil;
  t: Sozluk;
  renk: string;
  koyu: string;
  acikZemin: string;
}) {
  const [secili, setSecili] = useState<string[]>([]);
  const yonlendir = useRouter();

  const hepsi = useMemo(() => gruplar.flatMap((g) => g.hizmetler), [gruplar]);

  const ozet = useMemo(() => {
    const liste = hepsi.filter((h) => secili.includes(h.id));
    return {
      adet: liste.length,
      dakika: liste.reduce((toplam, h) => toplam + h.dakika, 0),
      // Fiyatı girilmemiş hizmet varsa toplam "eksik" olur; o yüzden
      // tutarı ancak hepsinin fiyatı varsa gösteriyoruz.
      tutar: liste.every((h) => typeof h.fiyat === "number")
        ? liste.reduce((toplam, h) => toplam + (h.fiyat ?? 0), 0)
        : undefined,
    };
  }, [hepsi, secili]);

  function degistir(id: string) {
    setSecili((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  }

  function randevuyaGit() {
    const p = new URLSearchParams();
    if (secili.length) p.set("h", secili.join(","));
    if (dil === "en") p.set("dil", "en");
    const sorgu = p.toString();
    yonlendir.push(`/${slug}/randevu${sorgu ? `?${sorgu}` : ""}`);
  }

  return (
    <>
      <p className="mt-3 text-[14.5px] opacity-60">{t.hizmetSecmeIpucu}</p>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {gruplar.map((g) => (
          <div key={g.grup} className="rounded-[22px] p-6" style={{ background: acikZemin }}>
            <h3 className="text-[13px] font-semibold tracking-[0.16em] uppercase opacity-45">
              {g.baslik}
            </h3>
            <ul className="mt-3">
              {g.hizmetler.map((h) => {
                const isaretli = secili.includes(h.id);
                return (
                  <li key={h.id} className="border-b border-black/[.07] py-3 last:border-0">
                    <button
                      type="button"
                      onClick={() => degistir(h.id)}
                      aria-pressed={isaretli}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span
                        aria-hidden
                        className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border text-[12px] font-bold text-white transition-colors"
                        style={{
                          borderColor: isaretli ? renk : "rgba(0,0,0,.18)",
                          background: isaretli ? renk : "transparent",
                        }}
                      >
                        {isaretli ? "✓" : ""}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[16.5px] font-medium">
                          {sec(h.ad, h.adEn, dil)}
                        </span>
                        <span className="mt-0.5 block text-[13.5px] opacity-55">
                          {sureYazDil(h.dakika, dil)}
                          {h.aciklama ? ` · ${sec(h.aciklama, h.aciklamaEn, dil)}` : ""}
                        </span>
                      </span>

                      {/* Fiyatı girilmemiş hizmetlerde metin uzun; dar
                          ekranda kartın dışına taşmasın diye sınırlı. */}
                      <span className="w-[96px] shrink-0 text-right sm:w-[120px]">
                        <span className="block text-[16px] leading-[1.25] font-semibold">
                          {fiyatYazDil(h.fiyat, dil) ?? (
                            <span className="text-[12.5px] font-normal opacity-55">
                              {t.salondaBelirlenir}
                            </span>
                          )}
                        </span>
                        <span
                          className="mt-0.5 block text-[12.5px] font-semibold"
                          style={{ color: isaretli ? renk : "rgba(0,0,0,.35)" }}
                        >
                          {isaretli ? t.hizmetSecildi : t.hizmetSec}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* masaüstünde bölümün altındaki düğme */}
      <div className="mt-8 hidden text-center md:block">
        <button
          type="button"
          onClick={randevuyaGit}
          className="inline-block rounded-full px-8 py-4 text-[16px] font-semibold text-white"
          style={{ background: koyu }}
        >
          {ozet.adet ? t.secerekDevam : t.saatSecRandevuAl}
        </button>
        {ozet.adet > 0 && (
          <p className="mt-3 text-[14px] opacity-65">
            {ozetYazi(ozet, dil, t)}
            {" · "}
            <button type="button" onClick={() => setSecili([])} className="underline">
              {t.secimTemizle}
            </button>
          </p>
        )}
      </div>

      {/* mobilde sabit çubuk */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t px-4 pt-3 md:hidden"
        style={{
          borderColor: "rgba(0,0,0,.08)",
          background: "rgba(255,255,255,.93)",
          backdropFilter: "blur(10px)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {ozet.adet > 0 && (
          <div className="mb-2 flex items-center justify-between text-[13.5px]">
            <span className="font-medium" style={{ color: koyu }}>
              {ozetYazi(ozet, dil, t)}
            </span>
            <button type="button" onClick={() => setSecili([])} className="underline opacity-60">
              {t.secimTemizle}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={randevuyaGit}
            className="flex-1 rounded-xl py-3.5 text-[16px] font-semibold text-white"
            style={{ background: koyu }}
          >
            {ozet.adet ? t.secerekDevam : t.randevuAl}
          </button>
          <a
            href={`tel:+${telefon}`}
            className="rounded-xl border px-5 py-3.5 text-[15px] font-medium"
            style={{ borderColor: "rgba(0,0,0,.16)", color: koyu }}
          >
            {t.ara}
          </a>
        </div>
      </div>
    </>
  );
}

function ozetYazi(
  ozet: { adet: number; dakika: number; tutar?: number },
  dil: Dil,
  t: Sozluk
): string {
  const bas =
    ozet.adet === 1 ? t.birHizmetSecildi : doldur(t.cokHizmetSecildi, { n: String(ozet.adet) });
  const parcalar = [bas, sureYazDil(ozet.dakika, dil)];
  const fiyat = fiyatYazDil(ozet.tutar, dil);
  if (fiyat) parcalar.push(fiyat);
  return parcalar.join(" · ");
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { GaleriOgesi } from "@/lib/salon";
import { type Dil, type Sozluk, sec } from "@/lib/dil";

/**
 * GALERİ
 *
 * Üç iş yapıyor:
 *   • Fotoğrafa basınca tam ekran açılır, oklarla gezilir.
 *   • "Öncesi" fotoğrafı olan işlerde sürgüyle karşılaştırma çıkar —
 *     kuaförün en ikna edici kozu bu, küçük küçük iki kare yan yana
 *     koymak onu öldürüyor.
 *   • Hizmet grubuna göre süzülür ("Renk", "Bakım"…), böylece
 *     ziyaretçi aradığı işi buluyor.
 */

export default function Galeri({
  ogeler,
  gruplar,
  grupAdi,
  dil,
  t,
  renk,
  koyu,
}: {
  ogeler: GaleriOgesi[];
  gruplar: string[];
  /** Grup başlığının gösterilecek hâli (dil seçilmiş olarak). */
  grupAdi: Record<string, string>;
  dil: Dil;
  t: Sozluk;
  renk: string;
  koyu: string;
}) {
  const [filtre, setFiltre] = useState<string | null>(null);
  const [acik, setAcik] = useState<number | null>(null);

  const liste = useMemo(
    () => (filtre ? ogeler.filter((o) => o.grup === filtre) : ogeler),
    [ogeler, filtre]
  );

  // Filtre değişince açık fotoğrafın sırası kayar; kapatmak en doğrusu.
  useEffect(() => setAcik(null), [filtre]);

  return (
    <>
      {gruplar.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Pul etiket={t.hepsi} secili={filtre === null} onClick={() => setFiltre(null)} renk={renk} />
          {gruplar.map((g) => (
            <Pul
              key={g}
              etiket={grupAdi[g] ?? g}
              secili={filtre === g}
              onClick={() => setFiltre(g)}
              renk={renk}
            />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {liste.map((o, i) => (
          <button
            key={o.url}
            type="button"
            onClick={() => setAcik(i)}
            className="group relative block overflow-hidden rounded-2xl"
            aria-label={sec(o.baslik, o.baslikEn, dil) ?? t.galeri}
          >
            <Image
              src={o.url}
              alt={sec(o.baslik, o.baslikEn, dil) ?? ""}
              width={1200}
              height={800}
              className="h-[200px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] md:h-[280px]"
            />
            {o.oncesi && (
              <span
                className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-white"
                style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}
              >
                {t.oncesiSonrasi}
              </span>
            )}
            {sec(o.baslik, o.baslikEn, dil) && (
              <span
                className="absolute inset-x-0 bottom-0 px-3 pt-8 pb-2.5 text-left text-[13px] font-medium text-white"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,.72))" }}
              >
                {sec(o.baslik, o.baslikEn, dil)}
              </span>
            )}
          </button>
        ))}
      </div>

      {liste.length === 0 && (
        <p className="mt-6 text-[15px] opacity-60">{t.buGruptaFotoYok}</p>
      )}

      {acik !== null && liste[acik] && (
        <TamEkran
          oge={liste[acik]}
          sira={acik}
          adet={liste.length}
          dil={dil}
          t={t}
          koyu={koyu}
          onKapat={() => setAcik(null)}
          onGec={(y) => setAcik((o) => (o === null ? null : (o + y + liste.length) % liste.length))}
        />
      )}
    </>
  );
}

function Pul({
  etiket,
  secili,
  onClick,
  renk,
}: {
  etiket: string;
  secili: boolean;
  onClick: () => void;
  renk: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={secili}
      className="rounded-full border px-4 py-2 text-[14px] font-medium transition-colors"
      style={{
        borderColor: secili ? renk : "rgba(0,0,0,.14)",
        background: secili ? `${renk}18` : "transparent",
        color: secili ? renk : "inherit",
      }}
    >
      {etiket}
    </button>
  );
}

/* ───────────────── tam ekran ───────────────── */

function TamEkran({
  oge,
  sira,
  adet,
  dil,
  t,
  koyu,
  onKapat,
  onGec,
}: {
  oge: GaleriOgesi;
  sira: number;
  adet: number;
  dil: Dil;
  t: Sozluk;
  koyu: string;
  onKapat: () => void;
  onGec: (yon: number) => void;
}) {
  // Klavyeyle de gezilsin; arkadaki sayfa kaymasın.
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") onKapat();
      if (e.key === "ArrowRight") onGec(1);
      if (e.key === "ArrowLeft") onGec(-1);
    };
    document.addEventListener("keydown", tus);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = eski;
    };
  }, [onKapat, onGec]);

  const baslik = sec(oge.baslik, oge.baslikEn, dil);

  // Sayfanın üst çubuğu ve alttaki sabit çubuk kendi yığın bağlamlarını
  // kuruyor; z-index tek başına yetmiyor. Bu yüzden tam ekranı doğrudan
  // <body> altına taşıyoruz.
  const [hazir, setHazir] = useState(false);
  useEffect(() => setHazir(true), []);
  if (!hazir) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={baslik ?? t.galeri}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(10,6,8,.96)" }}
      onClick={onKapat}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-[13.5px] opacity-70">
          {sira + 1} / {adet}
        </span>
        <button
          type="button"
          onClick={onKapat}
          aria-label={t.kapat}
          className="grid h-10 w-10 place-items-center rounded-full text-[22px] leading-none"
          style={{ background: "rgba(255,255,255,.14)" }}
        >
          ×
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center px-3 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        {adet > 1 && <Ok yon={-1} onClick={() => onGec(-1)} etiket={t.geri} />}
        <div className="max-h-full min-w-0 flex-1">
          {oge.oncesi ? (
            <Karsilastir oncesi={oge.oncesi} sonrasi={oge.url} t={t} koyu={koyu} />
          ) : (
            <Image
              src={oge.url}
              alt={baslik ?? ""}
              width={1600}
              height={1200}
              className="mx-auto max-h-[72vh] w-auto rounded-xl object-contain"
            />
          )}
          {baslik && (
            <p className="mt-3 text-center text-[14.5px] text-white opacity-80">{baslik}</p>
          )}
        </div>
        {adet > 1 && <Ok yon={1} onClick={() => onGec(1)} etiket={t.devam} />}
      </div>
    </div>,
    document.body
  );
}

function Ok({ yon, onClick, etiket }: { yon: number; onClick: () => void; etiket: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiket}
      className="mx-1 hidden h-12 w-12 shrink-0 place-items-center rounded-full text-white sm:grid"
      style={{ background: "rgba(255,255,255,.14)" }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={yon < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ───────────────── öncesi / sonrası ───────────────── */

/**
 * Sürgü: iki fotoğraf üst üste, üstteki soldan sağa kırpılıyor.
 * Parmakla ya da fareyle sürüklenebiliyor, klavyede de ok tuşlarıyla.
 */
function Karsilastir({
  oncesi,
  sonrasi,
  t,
  koyu,
}: {
  oncesi: string;
  sonrasi: string;
  t: Sozluk;
  koyu: string;
}) {
  const [oran, setOran] = useState(50);
  const kutu = useRef<HTMLDivElement>(null);
  const suruyor = useRef(false);

  function konumla(x: number) {
    const k = kutu.current?.getBoundingClientRect();
    if (!k || k.width === 0) return;
    setOran(Math.min(100, Math.max(0, ((x - k.left) / k.width) * 100)));
  }

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div
        ref={kutu}
        className="relative overflow-hidden rounded-xl select-none"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          suruyor.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          konumla(e.clientX);
        }}
        onPointerMove={(e) => suruyor.current && konumla(e.clientX)}
        onPointerUp={() => (suruyor.current = false)}
        onPointerCancel={() => (suruyor.current = false)}
      >
        <Image
          src={sonrasi}
          alt=""
          width={1600}
          height={1200}
          className="max-h-[66vh] w-full object-contain"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - oran}% 0 0)` }}
        >
          <Image
            src={oncesi}
            alt=""
            width={1600}
            height={1200}
            className="max-h-[66vh] w-full object-contain"
          />
        </div>

        {/* sürgü çizgisi */}
        <div
          aria-hidden
          className="absolute inset-y-0 w-[2px]"
          style={{ left: `${oran}%`, background: "rgba(255,255,255,.9)" }}
        />
        <div
          aria-hidden
          className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[15px] font-bold"
          style={{ left: `${oran}%`, top: "50%", background: "#fff", color: koyu }}
        >
          ↔
        </div>

        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-semibold text-white">
          {t.oncesi}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-semibold text-white">
          {t.sonrasi}
        </span>
      </div>

      {/* dokunmatik olmayan erişim: klavyeyle de kaydırılabilsin */}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(oran)}
        onChange={(e) => setOran(Number(e.target.value))}
        aria-label={t.oncesiSonrasi}
        className="mt-3 w-full"
      />
    </div>
  );
}

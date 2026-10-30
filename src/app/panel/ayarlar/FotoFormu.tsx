"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Personel } from "@/lib/salon";
import { gorselSilEylem, gorselYukleEylem } from "../eylemler";

/* ───────── tek yükleme kutusu ───────── */

function Yukle({
  tur,
  personelId,
  etiket,
  ipucu,
  mevcut,
  oran,
  yuvarlak,
}: {
  tur: "logo" | "kapak" | "galeri" | "ekip";
  personelId?: string;
  etiket: string;
  ipucu?: string;
  mevcut?: string;
  oran: string;
  yuvarlak?: boolean;
}) {
  const [durum, gonder, bekliyor] = useActionState(gorselYukleEylem, null);
  const form = useRef<HTMLFormElement>(null);
  const [onizleme, setOnizleme] = useState<string | null>(null);

  useEffect(() => {
    if (durum === "tamam") {
      form.current?.reset();
      setOnizleme(null);
    }
  }, [durum]);

  const hata = durum && durum !== "tamam" ? durum : null;
  const gosterilen = onizleme ?? mevcut;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-gri">{etiket}</span>
        {mevcut && (
          <form action={gorselSilEylem}>
            <input type="hidden" name="tur" value={tur} />
            {personelId && <input type="hidden" name="personelId" value={personelId} />}
            <button className="text-[12.5px] text-silik hover:text-ana">Kaldır</button>
          </form>
        )}
      </div>

      <form ref={form} action={gonder}>
        <input type="hidden" name="tur" value={tur} />
        {personelId && <input type="hidden" name="personelId" value={personelId} />}

        <label
          className={`relative block cursor-pointer overflow-hidden border border-dashed border-cizgi bg-kagit transition-colors hover:border-ana ${
            yuvarlak ? "mx-auto aspect-square w-28 rounded-full" : `${oran} rounded-2xl`
          }`}
        >
          {gosterilen ? (
            <Image
              src={gosterilen}
              alt={etiket}
              fill
              unoptimized={gosterilen.startsWith("blob:")}
              className={tur === "logo" ? "object-contain p-3" : "object-cover"}
            />
          ) : (
            <span className="grid h-full w-full place-items-center px-3 text-center text-[13px] text-silik">
              {bekliyor ? "Yükleniyor…" : "Fotoğraf seç"}
            </span>
          )}

          {bekliyor && gosterilen && (
            <span className="absolute inset-0 grid place-items-center bg-white/70 text-[13px] font-medium">
              Yükleniyor…
            </span>
          )}

          <input
            type="file"
            name="dosya"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const d = e.target.files?.[0];
              if (d) setOnizleme(URL.createObjectURL(d));
              e.currentTarget.form?.requestSubmit();
            }}
          />
        </label>
      </form>

      {ipucu && !hata && <p className="mt-1.5 text-[12px] text-silik">{ipucu}</p>}
      {hata && (
        <p className="mt-1.5 text-[12.5px] text-ana-koyu" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}

/* ───────── bölüm ───────── */

export default function FotoFormu({
  logo,
  kapak,
  galeri,
  personel,
}: {
  logo?: string;
  kapak?: string;
  galeri?: string[];
  personel: Personel[];
}) {
  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Yukle
          tur="logo"
          etiket="Logo"
          ipucu="Arka planı şeffaf PNG en iyisi."
          mevcut={logo}
          oran="aspect-square"
        />
        <Yukle
          tur="kapak"
          etiket="Kapak fotoğrafı"
          ipucu="Sayfanın en üstünde görünür."
          mevcut={kapak}
          oran="aspect-[4/3]"
        />
      </div>

      <div>
        <h3 className="mb-3 text-[14px] font-semibold">Galeri</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(galeri ?? []).map((g) => (
            <div key={g} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={g} alt="" fill className="object-cover" />
              <form action={gorselSilEylem} className="absolute top-1.5 right-1.5">
                <input type="hidden" name="tur" value="galeri" />
                <input type="hidden" name="url" value={g} />
                <button
                  aria-label="Fotoğrafı kaldır"
                  className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-[15px] leading-none text-white"
                >
                  ×
                </button>
              </form>
            </div>
          ))}
          <Yukle tur="galeri" etiket="" mevcut={undefined} oran="aspect-[4/3]" />
        </div>
        <p className="mt-2 text-[12.5px] text-silik">
          Kendi salonunuzdan 5-6 fotoğraf yeter. En fazla 8.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-[14px] font-semibold">Ekip fotoğrafları</h3>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {personel.map((p) => (
            <div key={p.id}>
              <Yukle
                tur="ekip"
                personelId={p.id}
                etiket={p.ad || "İsimsiz"}
                mevcut={p.foto}
                oran="aspect-square"
                yuvarlak
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] text-silik">
          Yüz ortada olacak şekilde kırpılır. Fotoğraf koymazsanız baş harfi görünür.
        </p>
      </div>
    </div>
  );
}

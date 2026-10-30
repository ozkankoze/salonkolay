"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import type { GaleriOgesi, Personel } from "@/lib/salon";
import { galeriBilgiEylem, gorselSilEylem, gorselYukleEylem } from "../eylemler";

/* ───────── tek yükleme kutusu ───────── */

function Yukle({
  tur,
  personelId,
  hedef,
  etiket,
  ipucu,
  mevcut,
  oran,
  yuvarlak,
}: {
  tur: "logo" | "kapak" | "galeri" | "ekip" | "oncesi";
  personelId?: string;
  /** "oncesi" için: hangi galeri karesine bağlanacak. */
  hedef?: string;
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
        {hedef && <input type="hidden" name="hedef" value={hedef} />}

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
  gruplar,
  ingilizce,
  personel,
}: {
  logo?: string;
  kapak?: string;
  galeri?: GaleriOgesi[];
  /** Hizmetlerden gelen grup başlıkları — galeri filtresi bunlarla eşleşsin. */
  gruplar: string[];
  ingilizce?: boolean;
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
        <div className="space-y-3">
          {(galeri ?? []).map((g) => (
            <GaleriKaresi key={g.url} oge={g} gruplar={gruplar} ingilizce={ingilizce} />
          ))}
          <div className="max-w-[220px]">
            <Yukle tur="galeri" etiket="Fotoğraf ekle" mevcut={undefined} oran="aspect-[4/3]" />
          </div>
        </div>
        <p className="mt-2 text-[12.5px] text-silik">
          Kendi salonunuzdan 5-6 fotoğraf yeter. En fazla 8. Başlık yazıp grup seçerseniz
          ziyaretçi galeriyi süzebilir; “öncesi” karesi eklerseniz sitede kaydırmalı
          öncesi/sonrası gösterilir.
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


/* ───────── galeri karesi: başlık, grup ve "öncesi" ───────── */

function GaleriKaresi({
  oge,
  gruplar,
  ingilizce,
}: {
  oge: GaleriOgesi;
  gruplar: string[];
  ingilizce?: boolean;
}) {
  const [durum, kaydet, bekliyor] = useActionState(galeriBilgiEylem, null);

  return (
    <div className="rounded-2xl border border-cizgi p-3">
      <div className="flex gap-3">
        <div className="relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-xl">
          <Image src={oge.url} alt="" fill className="object-cover" />
          <form action={gorselSilEylem} className="absolute top-1 right-1">
            <input type="hidden" name="tur" value="galeri" />
            <input type="hidden" name="url" value={oge.url} />
            <button
              aria-label="Fotoğrafı kaldır"
              className="grid h-6 w-6 place-items-center rounded-full bg-black/55 text-[14px] leading-none text-white"
            >
              ×
            </button>
          </form>
        </div>

        <form action={kaydet} className="min-w-0 flex-1">
          <input type="hidden" name="url" value={oge.url} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="baslik"
              defaultValue={oge.baslik ?? ""}
              placeholder="Başlık (Balyaj çalışması)"
              className="w-full rounded-lg border border-cizgi bg-kagit px-3 py-2 text-[14px] outline-none focus:border-ana"
            />
            <input
              name="grup"
              defaultValue={oge.grup ?? ""}
              list="galeri-gruplari"
              placeholder="Grup (Saç, Renk…)"
              className="w-full rounded-lg border border-cizgi bg-kagit px-3 py-2 text-[14px] outline-none focus:border-ana"
            />
            {ingilizce && (
              <>
                <input
                  name="baslikEn"
                  defaultValue={oge.baslikEn ?? ""}
                  placeholder="Başlık (İngilizce)"
                  className="w-full rounded-lg border border-cizgi bg-kagit px-3 py-2 text-[14px] outline-none focus:border-ana"
                />
                <input
                  name="grupEn"
                  defaultValue={oge.grupEn ?? ""}
                  placeholder="Grup (İngilizce)"
                  className="w-full rounded-lg border border-cizgi bg-kagit px-3 py-2 text-[14px] outline-none focus:border-ana"
                />
              </>
            )}
          </div>
          <button
            disabled={bekliyor}
            className="mt-2 rounded-lg bg-ana px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-40"
          >
            {bekliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {durum && (
            <span
              className={`ml-2 text-[13px] ${durum === "tamam" ? "text-[#146b48]" : "text-ana-koyu"}`}
            >
              {durum === "tamam" ? "Kaydedildi." : durum}
            </span>
          )}
        </form>
      </div>

      <datalist id="galeri-gruplari">
        {gruplar.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      <div className="mt-3 border-t border-cizgi pt-3">
        {oge.oncesi ? (
          <div className="flex items-center gap-3">
            <div className="relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-xl">
              <Image src={oge.oncesi} alt="" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[13.5px] font-medium">“Öncesi” karesi eklendi</p>
              <form action={gorselSilEylem}>
                <input type="hidden" name="tur" value="oncesi" />
                <input type="hidden" name="url" value={oge.url} />
                <button className="mt-1 text-[12.5px] text-silik hover:text-ana">Kaldır</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-[200px]">
            <Yukle
              tur="oncesi"
              hedef={oge.url}
              etiket="“Öncesi” fotoğrafı (isteğe bağlı)"
              oran="aspect-[4/3]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

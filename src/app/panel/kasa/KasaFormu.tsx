"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { kasaEkleEylem } from "../eylemler";

export default function KasaFormu({ gun }: { gun: string }) {
  const [durum, gonder, bekliyor] = useActionState(kasaEkleEylem, null);
  const [tur, setTur] = useState<"gelir" | "gider">("gelir");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum === "tamam") form.current?.reset();
  }, [durum]);

  const hata = durum === "tamam" ? null : durum;
  const basarili = durum === "tamam";

  return (
    <form ref={form} action={gonder} className="rounded-3xl border border-cizgi bg-kart p-5">
      <input type="hidden" name="tur" value={tur} />

      <div className="mb-4 flex rounded-full bg-kagit p-1">
        {(["gelir", "gider"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTur(t)}
            className={`flex-1 rounded-full py-2.5 text-[14.5px] font-medium transition-colors ${
              tur === t ? "bg-kart shadow-sm" : "text-silik"
            }`}
          >
            {t === "gelir" ? "Gelir" : "Gider"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-gri">Gün</span>
          <input name="gun" type="date" defaultValue={gun} className={girisSinif} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-gri">Tutar (₺)</span>
          <input
            name="tutar"
            inputMode="decimal"
            placeholder="850"
            required
            className={girisSinif}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-[13px] font-medium text-gri">Açıklama</span>
        <input
          name="aciklama"
          placeholder={tur === "gelir" ? "Ayşe — kesim + fön" : "Boya alımı, kira, elektrik…"}
          className={girisSinif}
        />
      </label>

      {hata && (
        <p className="mt-3 rounded-xl bg-yumusak px-4 py-3 text-[14px] text-ana-koyu" role="alert">
          {hata}
        </p>
      )}
      {basarili && (
        <p className="mt-3 rounded-xl bg-[#e8f5ef] px-4 py-3 text-[14px] text-[#146b48]" role="status">
          Deftere yazıldı.
        </p>
      )}

      <button
        disabled={bekliyor}
        className="mt-4 w-full rounded-xl bg-ana py-3.5 text-[15.5px] font-semibold text-white disabled:opacity-40"
      >
        {bekliyor ? "Ekleniyor…" : tur === "gelir" ? "Gelir ekle" : "Gider ekle"}
      </button>
    </form>
  );
}

const girisSinif =
  "w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana";

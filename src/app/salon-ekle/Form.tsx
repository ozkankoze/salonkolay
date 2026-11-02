"use client";

import { useActionState } from "react";
import type { Dil, Sozluk } from "@/lib/dil";
import { salonBasvurusu, type BasvuruDurumu } from "./eylem";

const BASLANGIC: BasvuruDurumu = { hal: "bos" };

export default function Form({ dil, t }: { dil: Dil; t: Sozluk }) {
  const [durum, eylem, bekliyor] = useActionState(salonBasvurusu, BASLANGIC);

  if (durum.hal === "tamam") {
    return (
      <div className="rounded-[24px] border border-p-cizgi bg-p-kart p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-yumusak text-p-vurgu">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-4 text-[16.5px] text-p-murekkep">{t.sTamam}</p>
        <a href="tel:+905370108611" className="p-odak mt-2 inline-block text-[15px] font-medium text-p-vurgu">
          0537 010 86 11
        </a>
      </div>
    );
  }

  return (
    <form action={eylem} className="rounded-[24px] border border-p-cizgi bg-p-kart p-6 sm:p-8">
      <input type="hidden" name="dil" value={dil} />
      {/* bal kabı — ekran okuyucudan ve gözden gizli */}
      <input
        type="text"
        name="web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Alan ad="ad" etiket={t.sSalonAdi} gerekli />
        <Alan ad="sehir" etiket={t.sSehir} gerekli />
        <Alan ad="telefon" etiket={t.sTelefon} tur="tel" gerekli />
        <Alan ad="instagram" etiket={t.sInstagram} />
        <div className="sm:col-span-2">
          <Alan ad="eposta" etiket={t.sEposta} tur="email" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="not" className="block text-[14px] font-medium text-p-gri">
            {t.sNot}
          </label>
          <textarea
            id="not"
            name="not"
            rows={3}
            className="mt-1.5 w-full resize-y rounded-2xl border border-p-cizgi bg-p-zemin px-4 py-3 text-[16px] text-p-murekkep outline-none focus:border-p-vurgu"
          />
        </div>
      </div>

      {durum.hal === "hata" && (
        <p className="mt-5 rounded-2xl bg-yumusak px-4 py-3 text-[14.5px] text-p-vurgu2">
          {durum.mesaj}{" "}
          {durum.telefon && (
            <a href="tel:+905370108611" className="font-medium underline">
              0537 010 86 11
            </a>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="p-odak mt-6 w-full rounded-full bg-p-murekkep px-6 py-4 text-[16px] font-medium text-white transition-colors hover:bg-p-vurgu2 disabled:opacity-60 sm:w-auto sm:px-9"
      >
        {bekliyor ? t.sGonderiliyor : t.sGonder}
      </button>

      <p className="mt-4 text-[13px] leading-relaxed text-p-silik">{t.sKvkk}</p>
    </form>
  );
}

function Alan({
  ad,
  etiket,
  tur = "text",
  gerekli = false,
}: {
  ad: string;
  etiket: string;
  tur?: string;
  gerekli?: boolean;
}) {
  return (
    <div>
      <label htmlFor={ad} className="block text-[14px] font-medium text-p-gri">
        {etiket}
      </label>
      <input
        id={ad}
        name={ad}
        type={tur}
        required={gerekli}
        autoComplete={tur === "tel" ? "tel" : tur === "email" ? "email" : "off"}
        className="mt-1.5 w-full rounded-2xl border border-p-cizgi bg-p-zemin px-4 py-3 text-[16px] text-p-murekkep outline-none focus:border-p-vurgu"
      />
    </div>
  );
}

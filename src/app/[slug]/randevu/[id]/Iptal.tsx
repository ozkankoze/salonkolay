"use client";

import { useActionState, useState } from "react";
import type { Dil, Sozluk } from "@/lib/dil";
import { iptalEylem } from "./eylem";

export default function Iptal({
  salon,
  id,
  anahtar,
  renk,
  koyu,
  dil,
  t,
}: {
  salon: string;
  id: string;
  anahtar: string;
  renk: string;
  koyu: string;
  dil: Dil;
  t: Sozluk;
}) {
  const [durum, gonder, bekliyor] = useActionState(iptalEylem, null);
  const [emin, setEmin] = useState(false);

  if (durum === "tamam")
    return (
      <div
        className="rounded-2xl border p-5 text-center"
        style={{ borderColor: "rgba(0,0,0,.08)", background: "rgba(255,255,255,.7)" }}
      >
        <p className="text-[16px] font-semibold" style={{ color: koyu }}>
          {t.randevunuzIptalEdildi}
        </p>
        <p className="mt-1.5 text-[14.5px] text-gri">{t.salonaBildirildi}</p>
      </div>
    );

  if (!emin)
    return (
      <div>
        <button
          onClick={() => setEmin(true)}
          className="w-full rounded-xl border py-3.5 text-[15.5px] font-medium"
          style={{ borderColor: "rgba(0,0,0,.15)", color: koyu }}
        >
          {t.randevuyuIptalEt}
        </button>
        {durum && durum !== "tamam" && (
          <p className="mt-3 text-center text-[14px]" role="alert" style={{ color: renk }}>
            {durum}
          </p>
        )}
      </div>
    );

  return (
    <form action={gonder}>
      <input type="hidden" name="salon" value={salon} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="anahtar" value={anahtar} />
      <input type="hidden" name="dil" value={dil} />

      <p className="mb-3 text-center text-[14.5px] text-gri">{t.eminMisiniz}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEmin(false)}
          className="flex-1 rounded-xl border py-3.5 text-[15.5px] font-medium"
          style={{ borderColor: "rgba(0,0,0,.15)", color: koyu }}
        >
          {t.vazgec}
        </button>
        <button
          disabled={bekliyor}
          className="flex-1 rounded-xl py-3.5 text-[15.5px] font-semibold text-white disabled:opacity-50"
          style={{ background: renk }}
        >
          {bekliyor ? t.iptalEdiliyor : t.evetIptalEt}
        </button>
      </div>

      {durum && durum !== "tamam" && (
        <p className="mt-3 text-center text-[14px]" role="alert" style={{ color: renk }}>
          {durum}
        </p>
      )}
    </form>
  );
}

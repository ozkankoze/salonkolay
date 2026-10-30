"use client";

import { useActionState, useEffect, useState } from "react";
import type { Salon } from "@/lib/salon";
import { type Dil, type Sozluk, gunYazDil } from "@/lib/dil";
import { gunAnahtar } from "@/lib/saat";
import { simdiTR } from "@/lib/zaman";
import { erteleEylem } from "./eylem";

/**
 * SAATİ DEĞİŞTİR
 *
 * Eskiden müşteri saatini kaydırmak için randevusunu iptal edip
 * baştan almak zorundaydı — arada o saati başkası kapabiliyordu.
 * Burada eski randevu yerinde durur, yeni saat tutulduğu anda taşınır.
 *
 * Uygun saatler sunucudan geliyor; müşterinin kendi randevusu çakışma
 * sayılmasın diye `yok` parametresiyle dışarıda bırakılıyor.
 */
export default function Ertele({
  salon,
  id,
  anahtar,
  dakika,
  personelId,
  dil,
  t,
  renk,
  koyu,
}: {
  salon: Salon;
  id: string;
  anahtar: string;
  dakika: number;
  personelId: string;
  dil: Dil;
  t: Sozluk;
  renk: string;
  koyu: string;
}) {
  const [acik, setAcik] = useState(false);
  const [gun, setGun] = useState("");
  const [saat, setSaat] = useState("");
  const [saatler, setSaatler] = useState<string[] | null>(null);
  const [durum, gonder, bekliyor] = useActionState(erteleEylem, null);

  const gunler = (() => {
    const liste: { anahtar: string; d: Date; kapali: boolean }[] = [];
    const bas = simdiTR();
    for (let i = 0; i < salon.ufukGun; i++) {
      const d = new Date(bas.getFullYear(), bas.getMonth(), bas.getDate() + i);
      const c = salon.calisma.find((x) => x.gun === d.getDay());
      liste.push({ anahtar: gunAnahtar(d), d, kapali: !c || !!c.kapali });
    }
    return liste;
  })();

  useEffect(() => {
    if (!gun) return;
    let iptal = false;
    setSaatler(null);
    setSaat("");
    const p = new URLSearchParams({
      salon: salon.slug,
      gun,
      dk: String(dakika),
      personel: personelId,
      yok: id,
    });
    fetch(`/api/musait?${p}`)
      .then((c) => c.json())
      .then((v) => !iptal && setSaatler(Array.isArray(v.saatler) ? v.saatler : []))
      .catch(() => !iptal && setSaatler([]));
    return () => {
      iptal = true;
    };
  }, [gun, salon.slug, dakika, personelId, id]);

  if (durum === "tamam")
    return (
      <div
        className="rounded-2xl border p-5 text-center"
        style={{ borderColor: "rgba(0,0,0,.08)", background: "rgba(255,255,255,.7)" }}
      >
        <p className="text-[16px] font-semibold" style={{ color: koyu }}>
          {t.saatDegisti}
        </p>
        <p className="mt-1.5 text-[14.5px] text-gri">{t.saatDegistiAciklama}</p>
      </div>
    );

  if (!acik)
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="w-full rounded-xl border py-3.5 text-[15.5px] font-medium"
        style={{ borderColor: "rgba(0,0,0,.15)", color: koyu }}
      >
        {t.saatiDegistir}
      </button>
    );

  return (
    <form action={gonder} className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,.12)" }}>
      <input type="hidden" name="salon" value={salon.slug} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="anahtar" value={anahtar} />
      <input type="hidden" name="dil" value={dil} />
      <input type="hidden" name="gun" value={gun} />
      <input type="hidden" name="saat" value={saat} />

      <p className="text-[15px] font-semibold" style={{ color: koyu }}>
        {t.yeniSaatSecin}
      </p>

      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {gunler.map((g) => {
          const aktif = gun === g.anahtar;
          return (
            <button
              key={g.anahtar}
              type="button"
              disabled={g.kapali}
              onClick={() => setGun(g.anahtar)}
              className="w-[58px] shrink-0 rounded-xl border py-2 text-center disabled:opacity-30"
              style={{
                borderColor: aktif ? renk : "rgba(0,0,0,.12)",
                background: aktif ? renk : "transparent",
                color: aktif ? "#fff" : undefined,
              }}
            >
              <span className="block text-[11.5px] opacity-70">{t.gunlerKisa[g.d.getDay()]}</span>
              <span className="block text-[18px] leading-tight font-semibold">{g.d.getDate()}</span>
              <span className="block text-[10.5px] opacity-70">{t.aylarKisa[g.d.getMonth()]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[76px]">
        {!gun && <p className="text-[14px] text-silik">{t.onceGunSecin}</p>}
        {gun && saatler === null && <p className="text-[14px] text-silik">{t.saatlerGetiriliyor}</p>}
        {gun && saatler?.length === 0 && (
          <p className="text-[14px] text-silik">
            {t.oGunMusaitDegil} {t.baskaGunSecin}
          </p>
        )}
        {gun && saatler && saatler.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {saatler.map((x) => {
              const aktif = saat === x;
              return (
                <button
                  key={x}
                  type="button"
                  onClick={() => setSaat(x)}
                  className="rounded-lg border py-2 text-[14.5px] font-medium"
                  style={{
                    borderColor: aktif ? renk : "rgba(0,0,0,.12)",
                    background: aktif ? renk : "transparent",
                    color: aktif ? "#fff" : undefined,
                  }}
                >
                  {x}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {gun && saat && (
        <p className="mt-2 text-[13.5px] text-gri">
          {t.yeniSaat}: <b style={{ color: koyu }}>{gunYazDil(gun, dil)} · {saat}</b>
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setAcik(false)}
          className="flex-1 rounded-xl border py-3 text-[15px] font-medium"
          style={{ borderColor: "rgba(0,0,0,.15)", color: koyu }}
        >
          {t.vazgec}
        </button>
        <button
          disabled={!gun || !saat || bekliyor}
          className="flex-1 rounded-xl py-3 text-[15px] font-semibold text-white disabled:opacity-40"
          style={{ background: renk }}
        >
          {bekliyor ? t.kaydediliyor : t.saatiDegistir}
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

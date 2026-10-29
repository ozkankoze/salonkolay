"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Hizmet, Personel } from "@/lib/salon";
import { elleRandevuEylem } from "../eylemler";

export default function ElleRandevu({
  gun,
  hizmetler,
  personel,
}: {
  gun: string;
  hizmetler: Hizmet[];
  personel: Personel[];
}) {
  const [acik, setAcik] = useState(false);
  const [durum, gonder, bekliyor] = useActionState(elleRandevuEylem, null);
  const [secili, setSecili] = useState<string[]>([]);
  const form = useRef<HTMLFormElement>(null);

  // kayıt başarılıysa formu kapat ve temizle
  useEffect(() => {
    if (durum === "tamam") {
      form.current?.reset();
      setSecili([]);
      setAcik(false);
    }
  }, [durum]);

  const hata = durum === "tamam" ? null : durum;

  const toplamDk = hizmetler
    .filter((h) => secili.includes(h.id))
    .reduce((t, h) => t + h.dakika, 0);

  if (!acik)
    return (
      <button
        onClick={() => setAcik(true)}
        className="w-full rounded-2xl border border-dashed border-cizgi py-4 text-[15px] font-medium text-ana"
      >
        + Telefonla gelen randevuyu ekle
      </button>
    );

  return (
    <form ref={form} action={gonder} className="rounded-3xl border border-cizgi bg-kart p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">Elle randevu</h3>
        <button
          type="button"
          onClick={() => setAcik(false)}
          className="text-[14px] text-silik"
        >
          Kapat
        </button>
      </div>

      <input type="hidden" name="gun" value={gun} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Alan etiket="Müşteri adı">
          <input name="ad" required placeholder="Ayşe Yılmaz" className={girisSinif} />
        </Alan>
        <Alan etiket="Telefon">
          <input name="telefon" inputMode="tel" placeholder="05xx xxx xx xx" className={girisSinif} />
        </Alan>
        <Alan etiket="Saat">
          <input name="saat" type="time" step={300} required className={girisSinif} />
        </Alan>
        <Alan etiket="Kim bakacak">
          <select name="personel" className={girisSinif} defaultValue="farketmez">
            <option value="farketmez">Farketmez</option>
            {personel.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
              </option>
            ))}
          </select>
        </Alan>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-[13px] font-medium text-gri">
          Hizmetler{toplamDk > 0 ? ` · ${toplamDk} dk` : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          {hizmetler.map((h) => {
            const isaretli = secili.includes(h.id);
            return (
              <label
                key={h.id}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-[14px] ${
                  isaretli ? "border-ana bg-yumusak text-ana-koyu" : "border-cizgi text-gri"
                }`}
              >
                <input
                  type="checkbox"
                  name="hizmet"
                  value={h.id}
                  checked={isaretli}
                  onChange={(e) =>
                    setSecili((o) =>
                      e.target.checked ? [...o, h.id] : o.filter((x) => x !== h.id)
                    )
                  }
                  className="sr-only"
                />
                {h.ad}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Alan etiket="Not (isteğe bağlı)">
          <input name="not" placeholder="Kısa saç, kahve istemiyor…" className={girisSinif} />
        </Alan>
      </div>

      {hata && (
        <p className="mt-3 rounded-xl bg-yumusak px-4 py-3 text-[14px] text-ana-koyu" role="alert">
          {hata}
        </p>
      )}

      <button
        disabled={bekliyor || secili.length === 0}
        className="mt-4 w-full rounded-xl bg-ana py-3.5 text-[15.5px] font-semibold text-white disabled:opacity-40"
      >
        {bekliyor ? "Ekleniyor…" : "Randevuyu ekle"}
      </button>
    </form>
  );
}

const girisSinif =
  "w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana";

function Alan({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gri">{etiket}</span>
      {children}
    </label>
  );
}

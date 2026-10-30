"use client";

import { useActionState } from "react";
import { izinEkleEylem } from "../eylemler";

/**
 * İzin / tatil: tarih aralığı vererek birden çok günü birden kapatır.
 * Tek tek gün kapatmak bir haftalık tatil için on tık demekti.
 */
export default function IzinFormu({ gun }: { gun: string }) {
  const [durum, gonder, bekliyor] = useActionState(izinEkleEylem, null);

  return (
    <details className="rounded-3xl border border-cizgi bg-kart p-5">
      <summary className="cursor-pointer list-none text-[15px] font-medium text-ana">
        İzin / tatil gir
      </summary>

      <form action={gonder} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-gri">İlk gün</span>
            <input
              name="bas"
              type="date"
              defaultValue={gun}
              className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none focus:border-ana"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-gri">Son gün</span>
            <input
              name="bit"
              type="date"
              defaultValue={gun}
              className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none focus:border-ana"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-gri">Sebep (isteğe bağlı)</span>
          <input
            name="sebep"
            placeholder="Yıllık izin, bayram tatili…"
            className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana"
          />
        </label>

        <button
          disabled={bekliyor}
          className="w-full rounded-xl border border-cizgi py-3.5 text-[15px] font-medium disabled:opacity-40"
        >
          {bekliyor ? "Kapatılıyor…" : "Bu günleri kapat"}
        </button>

        {durum && (
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-[14px] ${
              durum === "tamam" ? "bg-[#e8f5ef] text-[#146b48]" : "bg-yumusak text-ana-koyu"
            }`}
          >
            {durum === "tamam" ? "Günler kapatıldı." : durum}
          </p>
        )}

        <p className="text-[13px] text-silik">
          Kapattığınız günlerde müşteriler randevu alamaz. Tek tek açmak isterseniz günün
          programından “Aç” diyebilirsiniz.
        </p>
      </form>
    </details>
  );
}

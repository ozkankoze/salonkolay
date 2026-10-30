"use client";

import { useActionState, useState } from "react";
import { bildirimAyarEylem, denemePostasiEylem } from "../eylemler";

export default function BildirimFormu({
  eposta,
  bildirim,
  kurulu,
}: {
  eposta?: string;
  bildirim?: boolean;
  kurulu: boolean;
}) {
  const [durum, kaydet, bekliyor] = useActionState(bildirimAyarEylem, null);
  const [deneme, dene, deniyor] = useActionState(denemePostasiEylem, null);
  const [acik, setAcik] = useState(bildirim !== false);
  const [adres, setAdres] = useState(eposta ?? "");

  return (
    <div>
      <p className="mb-4 text-[14.5px] leading-relaxed text-gri">
        Müşteri randevu aldığında ve randevusunu iptal ettiğinde buraya e-posta gelir. Gün boyu
        panele bakmanıza gerek kalmaz.
      </p>

      <form action={kaydet}>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-gri">E-posta adresi</span>
          <input
            name="eposta"
            type="email"
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            placeholder="salon@ornek.com"
            className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana"
          />
        </label>

        <label className="mt-3 flex items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            name="bildirim"
            value="evet"
            checked={acik}
            onChange={(e) => setAcik(e.target.checked)}
            className="h-[18px] w-[18px] accent-[#b84a6e]"
          />
          Bildirim e-postası gönderilsin
        </label>

        {durum && (
          <p
            role="status"
            className={`mt-3 rounded-xl px-4 py-3 text-[14px] ${
              durum === "tamam" ? "bg-[#e8f5ef] text-[#146b48]" : "bg-yumusak text-ana-koyu"
            }`}
          >
            {durum === "tamam" ? "Kaydedildi." : durum}
          </p>
        )}

        <button
          disabled={bekliyor}
          className="mt-4 rounded-xl bg-ana px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          {bekliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>

      <form action={dene} className="mt-5 border-t border-cizgi pt-5">
        <p className="mb-3 text-[13.5px] text-gri">
          Kaydettikten sonra deneme gönderip gerçekten ulaştığını görün.
        </p>
        <button
          disabled={deniyor}
          className="rounded-xl border border-cizgi px-5 py-2.5 text-[14.5px] font-medium disabled:opacity-40"
        >
          {deniyor ? "Gönderiliyor…" : "Deneme e-postası gönder"}
        </button>

        {deneme && (
          <p
            role="status"
            className={`mt-3 rounded-xl px-4 py-3 text-[14px] ${
              deneme === "tamam" ? "bg-[#e8f5ef] text-[#146b48]" : "bg-yumusak text-ana-koyu"
            }`}
          >
            {deneme === "tamam"
              ? "Gönderildi. Birkaç saniye içinde gelmezse istenmeyen (spam) klasörüne bakın."
              : deneme}
          </p>
        )}
      </form>

      {!kurulu && (
        <p className="mt-5 rounded-xl bg-kagit px-4 py-3 text-[13px] leading-relaxed text-silik">
          Bu kurulumda e-posta gönderimi henüz açık değil. Adresi şimdi kaydedebilirsiniz;
          gönderim açıldığında bildirimler bu adrese gelmeye başlar.
        </p>
      )}
    </div>
  );
}

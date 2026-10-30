"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { DIL_CEREZI, type Dil } from "@/lib/dil";

/**
 * Dil değiştirme düğmesi.
 *
 * Seçim hem adrese (?dil=en) hem çereze yazılır: adres paylaşıldığında
 * karşı taraf da aynı dilde açar, ziyaretçi sitede gezerken tercihi korunur.
 */
export default function DilDugmesi({
  dil,
  renk,
  koyu,
}: {
  dil: Dil;
  renk?: string;
  koyu?: string;
}) {
  const yol = usePathname();
  const arama = useSearchParams();
  const yonlendir = useRouter();
  const [bekliyor, basla] = useTransition();

  const hedef: Dil = dil === "en" ? "tr" : "en";

  /**
   * `?dil=en` bağlantısıyla gelen ziyaretçinin çerezi henüz yoktur; kök
   * düzen dili çerezden okuduğu için sayfa İngilizce metinle `lang="tr"`
   * kalır. O zaman CSS'in `uppercase` kuralı Türkçe harita uygular ve
   * "ONLINE" yazısı "ONLİNE" olur. İkisini de burada hizaya çekiyoruz.
   */
  useEffect(() => {
    if (document.documentElement.lang !== dil) document.documentElement.lang = dil;
    if (!document.cookie.includes(`${DIL_CEREZI}=${dil}`))
      document.cookie = `${DIL_CEREZI}=${dil};path=/;max-age=31536000;samesite=lax`;
  }, [dil]);

  function degistir() {
    const p = new URLSearchParams(arama.toString());
    if (hedef === "en") p.set("dil", "en");
    else p.delete("dil");

    // Bir yıl boyunca hatırla.
    document.cookie = `${DIL_CEREZI}=${hedef};path=/;max-age=31536000;samesite=lax`;

    const sorgu = p.toString();
    basla(() => {
      yonlendir.replace(sorgu ? `${yol}?${sorgu}` : yol);
      yonlendir.refresh();
    });
  }

  return (
    <button
      onClick={degistir}
      disabled={bekliyor}
      aria-label={hedef === "en" ? "Switch to English" : "Türkçeye geç"}
      className="shrink-0 rounded-full border px-3 py-2 text-[13px] font-semibold transition disabled:opacity-50"
      style={{
        borderColor: renk ? `${renk}55` : "rgba(0,0,0,.14)",
        color: koyu ?? "inherit",
      }}
    >
      {hedef === "en" ? "EN" : "TR"}
    </button>
  );
}

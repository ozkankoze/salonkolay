/**
 * PUSH BİLDİRİMİ — yalnızca sunucu.
 *
 * Expo'nun push servisi üzerinden gönderiyoruz: tek bir HTTP isteği hem
 * iPhone'a (APNs) hem Android'e (FCM) ulaşıyor. Sertifika yönetimi,
 * iki ayrı entegrasyon ve kütüphane gerekmiyor — `fetch` yetiyor.
 *
 * ⚠️ GÖNDERİM RANDEVUYU ASLA BOZMAZ. E-postada olduğu gibi: hata olursa
 * sunucu kaydına bir satır düşer, randevu yine oluşur. Bildirim bir
 * kolaylıktır, randevunun şartı değildir.
 *
 * ⚠️ ÖLÜ JETONLAR TEMİZLENİR. Uygulama silindiğinde Expo
 * "DeviceNotRegistered" döner; o jetonu tabloda tutmak her randevuda
 * boşa istek demek, bu yüzden siliniyor.
 */

import { cihazSil, salonunCihazlari } from "./cihaz";

const ADRES = "https://exp.host/--/api/v2/push/send";

export type PushMesaji = {
  baslik: string;
  govde: string;
  /** Uygulama bildirime basınca nereyi açsın. */
  veri?: Record<string, string>;
};

type ExpoSonuc = {
  data?: { status: string; details?: { error?: string } }[];
};

/** Expo tek istekte en çok 100 bildirim alıyor. */
function parcala<T>(dizi: T[], boy = 100): T[][] {
  const p: T[][] = [];
  for (let i = 0; i < dizi.length; i += boy) p.push(dizi.slice(i, i + boy));
  return p;
}

export async function salonaPushGonder(slug: string, m: PushMesaji): Promise<void> {
  let jetonlar: string[];
  try {
    jetonlar = await salonunCihazlari(slug);
  } catch (e) {
    console.warn("[push] cihaz listesi okunamadı:", e);
    return;
  }
  if (jetonlar.length === 0) return;

  for (const grup of parcala(jetonlar)) {
    const govde = grup.map((to) => ({
      to,
      title: m.baslik,
      body: m.govde,
      data: m.veri ?? {},
      sound: "default",
      priority: "high",
      // iOS'ta uygulama simgesindeki rozet, okunmamış randevuyu değil
      // yalnız yeni bildirimi gösterir; sayıyı uygulama kendi yönetiyor.
      channelId: "randevu",
    }));

    try {
      const cevap = await fetch(ADRES, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(govde),
      });

      if (!cevap.ok) {
        console.warn("[push] gönderilemedi:", cevap.status, await cevap.text());
        continue;
      }

      const sonuc = (await cevap.json()) as ExpoSonuc;
      sonuc.data?.forEach((d, i) => {
        if (d.status === "error" && d.details?.error === "DeviceNotRegistered") {
          void cihazSil(grup[i]).catch(() => {});
        } else if (d.status === "error") {
          console.warn("[push] cihaz hatası:", d.details?.error);
        }
      });
    } catch (e) {
      console.warn("[push] istek patladı:", e);
    }
  }
}

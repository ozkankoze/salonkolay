import { durumDegistir, randevuBul } from "@/lib/depo";
import { govdeOku, hata, istekSalonu, jsonCevap, randevuOzeti } from "@/lib/mobil";

export const dynamic = "force-dynamic";

const DURUMLAR = ["bekliyor", "onaylandi", "iptal", "geldi"] as const;

/**
 * RANDEVU DURUMU
 *
 * PATCH { id, durum } -> { randevu }
 *
 * Uygulamadaki "Onayla / Geldi / İptal" düğmeleri buraya düşüyor.
 *
 * ⚠️ İPTAL BİLDİRİMİ GÖNDERİLMİYOR. `iptalBildir`, müşteri kendi iptal
 * ettiğinde salonu uyarmak için var. Salonun kendi telefonundan yaptığı
 * iptalde kendine bildirim göndermek anlamsız — hem de iptali yapan
 * kişinin cebinde öter.
 */
export async function PATCH(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const id = String(g.id ?? "").trim();
  const durum = String(g.durum ?? "");

  if (!id) return hata("Randevu kimliği gerekli.", 400);
  if (!(DURUMLAR as readonly string[]).includes(durum)) return hata("Geçersiz durum.", 400);

  const mevcut = await randevuBul(salon.slug, id);
  if (!mevcut) return hata("Randevu bulunamadı.", 404);

  await durumDegistir(salon.slug, id, durum as (typeof DURUMLAR)[number]);

  const yeni = await randevuBul(salon.slug, id);
  return jsonCevap({ randevu: yeni ? randevuOzeti(salon, yeni) : null });
}

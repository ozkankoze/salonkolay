/**
 * SALONA BİLDİRİM
 *
 * Kuaför gün boyu panele bakmaz. Müşteri gece randevu alırsa salonun
 * haberi olması lazım; bu dosya o köprüyü kurar.
 *
 * Gönderim hiçbir zaman randevu akışını bozmaz: hata olursa sessizce
 * geçilir, randevu yine de kaydedilmiştir.
 */

import { epostaGonder, iptalPostasi, yeniRandevuPostasi } from "./eposta";
import { gunYaz, telefonYaz } from "./bicim";
import { saatYaz, type Randevu } from "./saat";
import { fiyatYaz, type Salon } from "./salon";
import { siteKoku } from "./site";

function bildirimAcikMi(s: Salon): boolean {
  if (!s.eposta) return false;
  return s.bildirim !== false;
}

function bilgiCikar(salon: Salon, r: Randevu) {
  const hizmetler = salon.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
  const tutar = hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0);
  const kisi = salon.personel.find((p) => p.id === r.personelId);

  return {
    salonAdi: salon.ad,
    musteri: r.ad,
    telefon: telefonYaz(r.telefon),
    gun: gunYaz(r.gun),
    saat: saatYaz(r.baslangic),
    hizmetler: hizmetler.map((h) => h.ad).join(", "),
    kisi: kisi?.ad,
    tutar: tutar > 0 ? (fiyatYaz(tutar) ?? undefined) : undefined,
    not: r.not,
    panelAdresi: `${siteKoku()}/panel/bugun?g=${r.gun}`,
  };
}

/** Yeni randevu geldiğinde. Panelden eklenenler için gönderilmez. */
export async function yeniRandevuBildir(salon: Salon, r: Randevu): Promise<void> {
  if (!bildirimAcikMi(salon)) return;
  if (r.kaynak === "panel") return; // salonun kendi eklediği randevu

  const m = yeniRandevuPostasi(bilgiCikar(salon, r));
  const sonuc = await epostaGonder({ kime: salon.eposta!, ...m });
  if (!sonuc.tamam) console.warn("[bildirim] yeni randevu gönderilemedi:", sonuc.sebep);
}

/** Müşteri randevusunu iptal ettiğinde. */
export async function iptalBildir(salon: Salon, r: Randevu): Promise<void> {
  if (!bildirimAcikMi(salon)) return;

  const m = iptalPostasi(bilgiCikar(salon, r));
  const sonuc = await epostaGonder({ kime: salon.eposta!, ...m });
  if (!sonuc.tamam) console.warn("[bildirim] iptal gönderilemedi:", sonuc.sebep);
}

import { randevuEkle, salonunKapaliklari, salonunRandevulari } from "@/lib/depo";
import { dkCevir, personelSec, yerUygunMu } from "@/lib/saat";
import { bugunTR } from "@/lib/zaman";
import { govdeOku, hata, istekSalonu, jsonCevap, randevuOzeti } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * ELLE RANDEVU
 *
 * POST { gun, saat, hizmetIds[], personelId?, ad, telefon?, not? }
 *   -> { randevu }
 *
 * Telefonla arayan müşteriyi salonun kendisi giriyor. Panelde aynı iş
 * `elleRandevuEylem` ile yapılıyor; doğrulama ve çakışma kontrolü
 * birebir aynı — iki ayrı kural olursa biri diğerini tutmaz.
 *
 * ⚠️ BİLDİRİM GÖNDERİLMİYOR. `kaynak: "panel"` olduğu için
 * `yeniRandevuBildir` zaten çıkıyor; salonun kendi girdiği randevu için
 * kendine bildirim atmak anlamsız.
 *
 * ⚠️ DURUM "onaylandi". Salon telefonda zaten teyit etmiş oluyor;
 * "bekliyor" bırakmak panelde gereksiz bir onay işi yaratırdı.
 */
export async function POST(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const gun = String(g.gun ?? "");
  const saat = String(g.saat ?? "");
  const ad = String(g.ad ?? "").trim().slice(0, 80);
  const telefon = String(g.telefon ?? "").replace(/\D/g, "");
  const not = String(g.not ?? "").trim().slice(0, 300) || undefined;
  const hizmetIds = Array.isArray(g.hizmetIds) ? g.hizmetIds.map(String) : [];
  let personelId = String(g.personelId ?? "farketmez");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return hata("Gün seçilmemiş.", 400);
  if (gun < bugunTR()) return hata("Geçmiş bir güne randevu açılamaz.", 400);
  if (!/^\d{2}:\d{2}$/.test(saat)) return hata("Saat geçersiz.", 400);
  if (ad.length < 2) return hata("Müşterinin adını yazın.", 400);
  if (telefon && (telefon.length < 10 || telefon.length > 15))
    return hata("Telefon numarası geçerli görünmüyor.", 400);

  const hizmetler = salon.hizmetler.filter((h) => hizmetIds.includes(h.id));
  if (hizmetler.length === 0) return hata("En az bir hizmet seçin.", 400);

  const toplamDk = hizmetler.reduce((t, h) => t + h.dakika, 0);
  const baslangic = dkCevir(saat);

  const [mevcut, kapaliklar] = await Promise.all([
    salonunRandevulari(salon.slug),
    salonunKapaliklari(salon.slug),
  ]);

  if (personelId === "farketmez") {
    const secilen = personelSec(
      salon,
      gun,
      baslangic,
      toplamDk,
      hizmetler.map((h) => h.id),
      mevcut,
      kapaliklar,
    );
    if (!secilen) return hata("O saatte boş personel yok.", 409);
    personelId = secilen;
  } else if (!yerUygunMu(salon, gun, baslangic, toplamDk, personelId, mevcut, kapaliklar)) {
    return hata("O saat dolu veya kapalı.", 409);
  }

  const r = await randevuEkle({
    salon: salon.slug,
    gun,
    baslangic,
    dakika: toplamDk,
    personelId,
    hizmetIds: hizmetler.map((h) => h.id),
    ad,
    telefon,
    not,
    kaynak: "panel",
    durum: "onaylandi",
  });

  return jsonCevap({ randevu: randevuOzeti(salon, r) });
}

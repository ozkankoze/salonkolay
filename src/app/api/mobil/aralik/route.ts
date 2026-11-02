import { araliktakiRandevular, salonunKapaliklari } from "@/lib/depo";
import { anahtarGun, calismaBul } from "@/lib/saat";
import { bugunTR } from "@/lib/zaman";
import { hata, istekSalonu, jsonCevap } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * TAKVİM İÇİN GÜN ÖZETLERİ
 *
 * GET /api/mobil/aralik?bas=2026-11-01&son=2026-11-30
 *   -> { gunler: [{ gun, sayi, kapali }] }
 *
 * Randevuların tamamını değil, gün başına SAYIYI döndürüyoruz. Ay
 * görünümü otuz günün yüzlerce randevusunu çizmiyor; rakamı ve kapalı
 * bilgisini gösteriyor, güne basınca o günün ayrıntısı zaten
 * `/api/mobil/gun` ile geliyor.
 *
 * ⚠️ ARALIK SINIRLI. Açık uçlu bir sorgu, bütün geçmişi tek istekte
 * çekmeye açık kapı bırakırdı; en fazla 62 gün (iki ay) veriliyor.
 */
const AZAMI_GUN = 62;

export async function GET(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const url = new URL(istek.url);
  const bas = url.searchParams.get("bas") ?? "";
  const son = url.searchParams.get("son") ?? "";
  const bicim = /^\d{4}-\d{2}-\d{2}$/;
  if (!bicim.test(bas) || !bicim.test(son)) return hata("Tarih biçimi hatalı.", 400);
  if (son < bas) return hata("Bitiş, başlangıçtan önce olamaz.", 400);

  const gunFarki =
    (anahtarGun(son).getTime() - anahtarGun(bas).getTime()) / 86_400_000;
  if (gunFarki > AZAMI_GUN) return hata(`En fazla ${AZAMI_GUN} gün sorgulanabilir.`, 400);

  const [randevular, kapaliklar] = await Promise.all([
    araliktakiRandevular(salon.slug, bas, son),
    salonunKapaliklari(salon.slug),
  ]);

  // Tüm gün kapatmalar: saat aralığı verilmemiş kayıtlar.
  const tumGunKapali = new Set(
    kapaliklar.filter((k) => k.baslangic == null && k.bitis == null).map((k) => k.gun),
  );

  const sayac = new Map<string, number>();
  for (const r of randevular) {
    if (r.durum === "iptal") continue;
    sayac.set(r.gun, (sayac.get(r.gun) ?? 0) + 1);
  }

  const gunler: { gun: string; sayi: number; kapali: boolean }[] = [];
  for (let i = 0; i <= gunFarki; i++) {
    const d = new Date(anahtarGun(bas).getTime() + i * 86_400_000);
    const gun = d.toISOString().slice(0, 10);
    const c = calismaBul(salon, anahtarGun(gun));
    gunler.push({
      gun,
      sayi: sayac.get(gun) ?? 0,
      kapali: !c || !!c.kapali || tumGunKapali.has(gun),
    });
  }

  return jsonCevap({ bugun: bugunTR(), gunler });
}

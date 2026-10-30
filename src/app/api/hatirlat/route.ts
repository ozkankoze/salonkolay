import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { tumSalonSluglari, salonGetir } from "@/lib/salonVeri";
import { gununRandevulari } from "@/lib/depo";
import { gunlukOzetBildir } from "@/lib/bildirim";
import { bugunTR } from "@/lib/zaman";
import { gunKaydir } from "@/lib/bicim";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GÜNLÜK HATIRLATMA
 *
 * Her akşam çalışır, ertesi günün randevularını salona özet geçer.
 * Kuaför sabah paneli açmadan ne olduğunu bilsin.
 *
 * Müşteriye hatırlatma göndermiyoruz: randevu alırken e-posta adresi
 * istemiyoruz (form uzadıkça randevu bırakılıyor), SMS de paralı.
 * Onun yerine onay ekranında takvime ekleme bağlantısı var; müşterinin
 * kendi telefonu hatırlatıyor.
 *
 * Vercel Cron bu yolu çağırır ve isteğe `authorization` başlığı koyar.
 */
export async function GET(istek: Request) {
  if (!yetkili(istek)) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });

  // Varsayılan yarın; `?gun=` ile başka bir gün denenebilir (deneme
  // amaçlı, yetki yine şart).
  const istenen = new URL(istek.url).searchParams.get("gun");
  const yarin =
    istenen && /^\d{4}-\d{2}-\d{2}$/.test(istenen) ? istenen : gunKaydir(bugunTR(), 1);
  const sluglar = await tumSalonSluglari();
  const sonuc: Record<string, number> = {};

  for (const slug of sluglar) {
    const salon = await salonGetir(slug);
    if (!salon) continue;

    const randevular = (await gununRandevulari(slug, yarin)).filter((r) => r.durum !== "iptal");
    if (randevular.length === 0) continue; // boş gün için posta göndermiyoruz

    // Yalnız gerçekten gönderilenler sayılsın; adresi olmayan salonu
    // "gönderildi" diye raporlamak yanıltıcı olur.
    const gitti = await gunlukOzetBildir(salon, yarin, randevular);
    if (gitti) sonuc[slug] = randevular.length;
  }

  return NextResponse.json({ gun: yarin, salon: Object.keys(sonuc).length, randevu: sonuc });
}

/**
 * Vercel Cron `authorization: Bearer <CRON_SECRET>` gönderir.
 * CRON_SECRET tanımlı değilse yol kapalıdır — açıkta bırakmaktansa
 * hiç çalışmasın.
 */
function yetkili(istek: Request): boolean {
  const gizli = process.env.CRON_SECRET;
  if (!gizli) return false;
  const gelen = istek.headers.get("authorization") ?? "";
  const beklenen = `Bearer ${gizli}`;
  const a = Buffer.from(gelen);
  const b = Buffer.from(beklenen);
  return a.length === b.length && timingSafeEqual(a, b);
}

import { gununRandevulari, kasadaVarMi, salonunKapaliklari } from "@/lib/depo";
import { calismaBul, anahtarGun } from "@/lib/saat";
import { bugunTR } from "@/lib/zaman";
import { hata, istekSalonu, jsonCevap, randevuOzeti, salonOzeti } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * BİR GÜNÜN PROGRAMI
 *
 * GET /api/mobil/gun?gun=2026-11-03  -> { gun, calisma, randevular, kapaliklar }
 * `gun` verilmezse İstanbul saatine göre bugün.
 *
 * ⚠️ "BUGÜN" SUNUCUNUN SAATİ DEĞİL. Vercel UTC çalışıyor; akşam 22:00'de
 * sunucu hâlâ aynı günde olsa bile Türkiye yarına geçmiş olabiliyor.
 * `bugunTR()` bu yüzden var (bkz. zaman.ts).
 */
export async function GET(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const url = new URL(istek.url);
  const istenen = url.searchParams.get("gun") ?? "";
  const gun = /^\d{4}-\d{2}-\d{2}$/.test(istenen) ? istenen : bugunTR();

  const [randevular, kapaliklar] = await Promise.all([
    gununRandevulari(salon.slug, gun),
    salonunKapaliklari(salon.slug),
  ]);

  const calisma = calismaBul(salon, anahtarGun(gun)) ?? null;

  // Hangisi kasaya yazılmış? Uygulama "Kasaya ekle" düğmesini buna
  // bakarak gösteriyor; panelde de aynı kontrol var.
  const aktif = randevular
    .filter((r) => r.durum !== "iptal")
    .sort((a, b) => a.baslangic - b.baslangic);
  const kasada = await Promise.all(aktif.map((r) => kasadaVarMi(salon.slug, r.id)));

  return jsonCevap({
    gun,
    bugun: bugunTR(),
    salon: salonOzeti(salon),
    calisma,
    kapaliklar: kapaliklar.filter((k) => k.gun === gun),
    randevular: aktif.map((r, i) => ({ ...randevuOzeti(salon, r), kasada: kasada[i] })),
  });
}

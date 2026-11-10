import { cumleCoz, eksikler } from "@/lib/sesCoz";
import { simdiTR } from "@/lib/zaman";
import { govdeOku, hata, istekSalonu, jsonCevap } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * KONUŞMAYI RANDEVUYA ÇEVİRME
 *
 * POST { metin, gun? } -> { cozum, eksik[] }
 *
 * Ses tanıma telefonda yapılıyor (cihazın kendi motoru, ücretsiz ve
 * çevrimdışı çalışabiliyor); buraya yalnızca çıkan METİN geliyor.
 * Cümleyi randevuya çeviren kural tabanlı çözümleyici `sesCoz.ts` —
 * panelin sesli randevusu da aynı dosyayı kullanıyor, yani iki tarafta
 * iki ayrı anlama mantığı yok.
 *
 * ⚠️ SONUÇ DOĞRUDAN KAYDEDİLMİYOR. Dönen `cozum` uygulamada doldurulmuş
 * bir form olarak gösteriliyor, salon sahibi onaylıyor. Ses tanıma
 * özellikle isimlerde yanılıyor; "Melis" ile "Melisa" arasındaki farkı
 * sessizce randevuya yazmak doğru olmaz.
 */
export async function POST(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const metin = String(g.metin ?? "").trim().slice(0, 400);
  if (metin.length < 3) return hata("Söylenen anlaşılamadı.", 400);

  const varsayilanGun =
    typeof g.gun === "string" && /^\d{4}-\d{2}-\d{2}$/.test(g.gun) ? g.gun : undefined;

  const cozum = cumleCoz(metin, salon, simdiTR(), varsayilanGun);

  return jsonCevap({
    metin,
    cozum: {
      ad: cozum.ad ?? null,
      gun: cozum.gun ?? null,
      saat: cozum.saat ?? null,
      hizmetIds: cozum.hizmetIds,
      personelId: cozum.personelId ?? null,
      anlasilan: cozum.anlasilan,
    },
    eksik: eksikler(cozum),
  });
}

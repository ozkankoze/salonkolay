import { jetonUret, sifreDogruMu } from "@/lib/sifre";
import { salonGetir, salonSifreHash } from "@/lib/salonVeri";
import { govdeOku, hata, jsonCevap, salonOzeti } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * MOBİL GİRİŞ
 *
 * POST { slug, sifre } -> { jeton, salon }
 *
 * Panelin `girisDene` fonksiyonunu çağırmıyoruz: o çerez yazıyor,
 * uygulamanın çereze ihtiyacı yok. Doğrulama mantığı aynı — aynı
 * scrypt karşılaştırması, aynı imzalı jeton.
 *
 * ⚠️ HATA MESAJI AYRIM YAPMAZ. "Salon bulunamadı" ile "şifre yanlış"
 * ayrı cevaplar olsaydı, hangi slug'ların kayıtlı olduğu dışarıdan
 * tek tek denenerek öğrenilebilirdi.
 */
export async function POST(istek: Request) {
  const g = await govdeOku(istek);
  const slug = String(g.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const sifre = String(g.sifre ?? "");

  if (!slug || !sifre) return hata("Salon adresi ve şifre gerekli.", 400);

  const saklanan = await salonSifreHash(slug);
  if (!saklanan || !sifreDogruMu(sifre, saklanan)) {
    return hata("Salon adresi veya şifre hatalı.", 401);
  }

  const salon = await salonGetir(slug);
  if (!salon) return hata("Salon adresi veya şifre hatalı.", 401);

  return jsonCevap({ jeton: jetonUret(slug), salon: salonOzeti(salon) });
}

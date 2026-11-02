import { cihazKaydet, cihazSil, gecerliPushJetonu } from "@/lib/cihaz";
import { govdeOku, hata, istekSalonu, jsonCevap } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * CİHAZ KAYDI
 *
 * POST   { pushJeton, platform?, ad? }  -> bildirimleri aç
 * DELETE { pushJeton }                  -> bildirimleri kapat
 *
 * Uygulama her açılışta POST atıyor: Expo jetonu zamanla değişebiliyor
 * ve salon başka bir telefona geçmiş olabilir.
 */
export async function POST(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const pushJeton = g.pushJeton;
  if (!gecerliPushJetonu(pushJeton)) return hata("Geçersiz bildirim jetonu.", 400);

  const platform = String(g.platform ?? "bilinmiyor").slice(0, 20);
  const ad = g.ad ? String(g.ad).slice(0, 60) : undefined;

  await cihazKaydet({ jeton: pushJeton, salon: salon.slug, platform, ad });
  return jsonCevap({ tamam: true });
}

export async function DELETE(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  if (!gecerliPushJetonu(g.pushJeton)) return hata("Geçersiz bildirim jetonu.", 400);

  await cihazSil(g.pushJeton);
  return jsonCevap({ tamam: true });
}

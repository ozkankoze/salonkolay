/**
 * Şifre saklama ve oturum imzalama — düz metin şifre hiçbir yere yazılmaz.
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** "tuz:hash" üretir. */
export function sifreHashle(sifre: string): string {
  const tuz = randomBytes(16).toString("hex");
  const h = scryptSync(sifre, tuz, 32).toString("hex");
  return `${tuz}:${h}`;
}

export function sifreDogruMu(sifre: string, saklanan: string): boolean {
  const [tuz, h] = saklanan.split(":");
  if (!tuz || !h) return false;
  const deneme = scryptSync(sifre, tuz, 32);
  const dogru = Buffer.from(h, "hex");
  if (deneme.length !== dogru.length) return false;
  return timingSafeEqual(deneme, dogru);
}

function gizli(): string {
  return process.env.PANEL_SECRET ?? "salonkolay-gelistirme-anahtari-degistir";
}

/** slug + bitiş zamanı + imza. Çerezde bu durur. */
export function jetonUret(slug: string, gunSayisi = 30): string {
  const son = Date.now() + gunSayisi * 24 * 60 * 60 * 1000;
  const govde = `${slug}.${son}`;
  const imza = createHmac("sha256", gizli()).update(govde).digest("hex").slice(0, 32);
  return `${govde}.${imza}`;
}

export function jetonCoz(jeton: string | undefined): string | null {
  if (!jeton) return null;
  const parcalar = jeton.split(".");
  if (parcalar.length !== 3) return null;
  const [slug, sonStr, imza] = parcalar;
  const beklenen = createHmac("sha256", gizli())
    .update(`${slug}.${sonStr}`)
    .digest("hex")
    .slice(0, 32);
  if (imza.length !== beklenen.length) return null;
  if (!timingSafeEqual(Buffer.from(imza), Buffer.from(beklenen))) return null;
  if (Number(sonStr) < Date.now()) return null;
  return slug;
}

/**
 * Randevu iptal anahtarı.
 *
 * Müşteriye verilen bağlantının içinde bu imza bulunur. Kimse başkasının
 * randevusunu, kimliğini bilse bile iptal edemez; imzayı üretmek için
 * sunucudaki gizli anahtar gerekir.
 */
export function randevuImza(id: string): string {
  return createHmac("sha256", gizli()).update(`randevu.${id}`).digest("hex").slice(0, 20);
}

export function randevuImzaDogru(id: string, imza: string | undefined): boolean {
  if (!imza) return false;
  const beklenen = randevuImza(id);
  if (imza.length !== beklenen.length) return false;
  return timingSafeEqual(Buffer.from(imza), Buffer.from(beklenen));
}

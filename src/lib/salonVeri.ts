/**
 * SALON VERİSİ — yalnızca sunucu.
 *
 * Salonun bilgileri (hizmetler, saatler, ekip, tema) panelden
 * düzenlenebildiği için koddan değil veritabanından okunur.
 * `salon.ts` içindeki `salonlar` dizisi yalnızca ilk kurulum tohumudur.
 * DATABASE_URL yoksa tohumun bellekteki kopyası düzenlenir.
 *
 * Bu dosya istemci bileşenlerinden ASLA import edilmez — "pg" paketini
 * tarayıcı paketine sokar. İstemci tarafı `salon.ts`ten yalnız tip ve
 * saf yardımcı alır.
 */

import { pgVarMi, sorgu } from "./db";
import { sifreHashle } from "./sifre";
import { salonBul, salonlar, type Salon } from "./salon";

/**
 * Sayfalar ve API yolları ayrı paketlere derlendiği için bellek kopyası
 * globalThis üzerinde tutulur; yoksa panelden yapılan düzenleme siteye
 * yansımaz.
 */
type BellekSalon = { liste: Salon[] | null; sifre: string | null };
const kure = globalThis as unknown as { __salonkolaySalon?: BellekSalon };
kure.__salonkolaySalon ??= { liste: null, sifre: null };

function bellekKopya(): Salon[] {
  const k = kure.__salonkolaySalon!;
  if (!k.liste) k.liste = JSON.parse(JSON.stringify(salonlar)) as Salon[];
  return k.liste;
}

function varsayilanSifre(): string {
  return process.env.PANEL_SIFRE ?? "salon1234";
}

export async function salonGetir(slug: string): Promise<Salon | undefined> {
  const s = slug.toLowerCase();
  if (!pgVarMi()) return bellekKopya().find((x) => x.slug === s);

  const satirlar = await sorgu<{ veri: Salon }>(`select veri from salonlar where slug = $1`, [s]);
  if (satirlar[0]) return satirlar[0].veri;

  // İlk açılış: koddaki tohumu veritabanına yaz.
  const tohum = salonBul(s);
  if (!tohum) return undefined;
  await sorgu(
    `insert into salonlar (slug, veri, sifre_hash) values ($1, $2, $3)
     on conflict (slug) do nothing`,
    [s, JSON.stringify(tohum), sifreHashle(varsayilanSifre())]
  );
  return tohum;
}

export async function salonKaydet(salon: Salon): Promise<void> {
  if (!pgVarMi()) {
    const liste = bellekKopya();
    const i = liste.findIndex((x) => x.slug === salon.slug);
    if (i >= 0) liste[i] = salon;
    else liste.push(salon);
    return;
  }
  await sorgu(`update salonlar set veri = $2, guncelleme = now() where slug = $1`, [
    salon.slug,
    JSON.stringify(salon),
  ]);
}

/** Giriş kontrolü için saklanan şifre özeti. */
export async function salonSifreHash(slug: string): Promise<string | null> {
  if (!pgVarMi()) {
    const k = kure.__salonkolaySalon!;
    k.sifre ??= sifreHashle(varsayilanSifre());
    return bellekKopya().some((x) => x.slug === slug.toLowerCase()) ? k.sifre : null;
  }
  await salonGetir(slug); // kayıt yoksa tohumla
  const satirlar = await sorgu<{ sifre_hash: string }>(
    `select sifre_hash from salonlar where slug = $1`,
    [slug.toLowerCase()]
  );
  return satirlar[0]?.sifre_hash ?? null;
}

export async function salonSifreDegistir(slug: string, yeniHash: string): Promise<void> {
  if (!pgVarMi()) {
    kure.__salonkolaySalon!.sifre = yeniHash;
    return;
  }
  await sorgu(`update salonlar set sifre_hash = $2 where slug = $1`, [slug.toLowerCase(), yeniHash]);
}

/**
 * GÖRSEL DEPOSU
 *
 * Salonun logosu, kapak fotoğrafı, galerisi ve ekip fotoğrafları panelden
 * yükleniyor. Vercel'in dosya sistemi yazılamaz olduğu için görseller
 * veritabanında tutuluyor.
 *
 * Bu ölçekte (salon başına ~10 görsel, her biri 100-250 KB) bu yeterli ve
 * ayrı bir depolama servisi açmaya değmiyor. Servis ederken sonsuz
 * önbellek başlığı veriyoruz: adres içeriğe göre sabit olduğu için
 * tarayıcı ve CDN bir kez indirip saklıyor, veritabanına tekrar gidilmiyor.
 *
 * Görsel sayısı büyüyünce burayı bir nesne deposuna taşımak yeterli;
 * çağıran taraflar değişmez.
 */

import sharp from "sharp";
import { kimlikUret, pgVarMi, sorgu } from "./db";

export type GorselTuru = "logo" | "kapak" | "galeri" | "ekip";

/** Her tür için en uzun kenar ve kalite. */
const OLCU: Record<GorselTuru, { kenar: number; kalite: number; kare: boolean }> = {
  logo: { kenar: 600, kalite: 90, kare: false },
  kapak: { kenar: 1600, kalite: 82, kare: false },
  galeri: { kenar: 1400, kalite: 80, kare: false },
  ekip: { kenar: 800, kalite: 85, kare: true },
};

export const EN_BUYUK_GIRIS = 12 * 1024 * 1024; // 12 MB

const bellek = (() => {
  const kure = globalThis as unknown as {
    __salonkolayGorsel?: Map<string, { veri: Buffer; salon: string }>;
  };
  kure.__salonkolayGorsel ??= new Map();
  return kure.__salonkolayGorsel;
})();

/**
 * Yüklenen dosyayı küçültüp webp'e çevirir ve kaydeder.
 * Dönen değer sayfada kullanılacak adrestir.
 */
export async function gorselKaydet(
  salon: string,
  tur: GorselTuru,
  dosya: File
): Promise<{ url: string } | { hata: string }> {
  if (!dosya || dosya.size === 0) return { hata: "Dosya seçilmedi." };
  if (dosya.size > EN_BUYUK_GIRIS) return { hata: "Dosya çok büyük (en fazla 12 MB)." };
  if (!dosya.type.startsWith("image/")) return { hata: "Yalnızca görsel yükleyebilirsiniz." };

  const ham = Buffer.from(await dosya.arrayBuffer());
  const o = OLCU[tur];

  let islem = sharp(ham, { failOn: "none" }).rotate();
  islem = o.kare
    ? islem.resize(o.kenar, o.kenar, { fit: "cover", position: "attention" })
    : islem.resize(o.kenar, o.kenar, { fit: "inside", withoutEnlargement: true });

  let webp: Buffer;
  let genislik = 0;
  let yukseklik = 0;
  try {
    const sonuc = await islem.webp({ quality: o.kalite }).toBuffer({ resolveWithObject: true });
    webp = sonuc.data;
    genislik = sonuc.info.width;
    yukseklik = sonuc.info.height;
  } catch {
    return { hata: "Görsel okunamadı. Başka bir dosya deneyin." };
  }

  const id = kimlikUret();

  if (!pgVarMi()) {
    bellek.set(id, { veri: webp, salon });
  } else {
    await semaKur();
    await sorgu(
      `insert into gorseller (id, salon, tur, veri, genislik, yukseklik, boyut, olusturma)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, salon, tur, webp, genislik, yukseklik, webp.length, Date.now()]
    );
  }

  return { url: `/g/${id}.webp` };
}

/** Adresten görseli okur. Bulunamazsa null. */
export async function gorselOku(id: string): Promise<Buffer | null> {
  if (!pgVarMi()) return bellek.get(id)?.veri ?? null;
  await semaKur();
  const satirlar = await sorgu<{ veri: Buffer }>(`select veri from gorseller where id = $1`, [id]);
  return satirlar[0]?.veri ?? null;
}

/** Salonun artık kullanmadığı görseli siler. */
export async function gorselSil(salon: string, url: string): Promise<void> {
  const id = urlKimligi(url);
  if (!id) return;
  if (!pgVarMi()) {
    const k = bellek.get(id);
    if (k && k.salon === salon) bellek.delete(id);
    return;
  }
  await semaKur();
  await sorgu(`delete from gorseller where id = $1 and salon = $2`, [id, salon]);
}

/** "/g/abc123.webp" -> "abc123" ; bizim adresimiz değilse null. */
export function urlKimligi(url: string): string | null {
  const m = url.match(/^\/g\/([a-z0-9]+)\.webp$/i);
  return m ? m[1] : null;
}

let kurulum: Promise<void> | null = null;
function semaKur(): Promise<void> {
  kurulum ??= sorgu(`
    create table if not exists gorseller (
      id         text   primary key,
      salon      text   not null,
      tur        text   not null,
      veri       bytea  not null,
      genislik   int,
      yukseklik  int,
      boyut      int,
      olusturma  bigint not null
    );
    create index if not exists gorseller_salon on gorseller (salon);
  `).then(() => undefined);
  return kurulum;
}

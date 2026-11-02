/**
 * KAYITLI CİHAZLAR — yalnızca sunucu.
 *
 * Salon sahibinin telefonundaki uygulama, açılışta kendi push jetonunu
 * buraya yazar. Randevu geldiğinde o salonun bütün cihazlarına bildirim
 * gider: kuaförün telefonu, kasadakinin telefonu, tableti.
 *
 * ⚠️ JETON SAHİBİ DEĞİŞEBİLİR. Aynı push jetonu, uygulamayı silip başka
 * bir salonla giren birinde yeniden çıkabiliyor. Bu yüzden jeton birincil
 * anahtar ve kayıt `on conflict` ile salonu GÜNCELLİYOR — yoksa bir
 * salonun randevusu başka salonun telefonuna düşerdi.
 */

import { pgVarMi, sorgu } from "./db";

export type Cihaz = {
  jeton: string;
  salon: string;
  platform: string;
  ad?: string;
};

/** DATABASE_URL yokken bellekte tutulur — yerel denemeler için. */
const kure = globalThis as unknown as { __salonkolayCihaz?: Map<string, Cihaz> };
function bellek(): Map<string, Cihaz> {
  if (!kure.__salonkolayCihaz) kure.__salonkolayCihaz = new Map();
  return kure.__salonkolayCihaz;
}

/** Expo push jetonu biçimi — başka bir şey yazılmasın diye. */
export function gecerliPushJetonu(j: unknown): j is string {
  return typeof j === "string" && /^Expo(nent)?PushToken\[[A-Za-z0-9._-]+\]$/.test(j);
}

export async function cihazKaydet(c: Cihaz): Promise<void> {
  if (!pgVarMi()) {
    bellek().set(c.jeton, c);
    return;
  }
  await sorgu(
    `insert into cihazlar (jeton, salon, platform, ad)
     values ($1, $2, $3, $4)
     on conflict (jeton) do update
       set salon = excluded.salon,
           platform = excluded.platform,
           ad = excluded.ad,
           guncelleme = now()`,
    [c.jeton, c.salon, c.platform, c.ad ?? null],
  );
}

export async function cihazSil(jeton: string): Promise<void> {
  if (!pgVarMi()) {
    bellek().delete(jeton);
    return;
  }
  await sorgu(`delete from cihazlar where jeton = $1`, [jeton]);
}

export async function salonunCihazlari(salon: string): Promise<string[]> {
  if (!pgVarMi()) {
    return [...bellek().values()].filter((c) => c.salon === salon).map((c) => c.jeton);
  }
  const satirlar = await sorgu<{ jeton: string }>(
    `select jeton from cihazlar where salon = $1`,
    [salon],
  );
  return satirlar.map((s) => s.jeton);
}

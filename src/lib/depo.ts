/**
 * DEPO — randevu, kapalı saat ve kasa kayıtları.
 *
 * İki arka uç var ve dışarıdan ikisi de aynı görünür:
 *   • Postgres  — DATABASE_URL tanımlıysa
 *   • Bellek    — tanımlı değilse (demo / yerel deneme)
 *
 * Sayfalar ve API'ler bu dosyadaki fonksiyonlardan başka bir şey bilmez.
 */

import { kimlikUret, pgVarMi, sorgu } from "./db";
import type { Randevu } from "./saat";

export type Kapali = {
  id: string;
  salon: string;
  gun: string;
  /** null = tüm gün kapalı */
  baslangic: number | null;
  bitis: number | null;
  sebep?: string;
};

export type KasaKaydi = {
  id: string;
  salon: string;
  gun: string;
  tur: "gelir" | "gider";
  tutar: number;
  aciklama?: string;
  randevuId?: string;
  olusturma: number;
};

/* ───────────────────────── bellek yedeği ───────────────────────── */

/**
 * Next, sayfa bileşenlerini ve API yollarını ayrı paketlere derliyor;
 * modül seviyesindeki sıradan bir dizi ikisi arasında paylaşılmıyor.
 * Bu yüzden bellek deposu globalThis üzerinde tutuluyor — aksi hâlde
 * müşterinin aldığı randevu panelde görünmez.
 */
type BellekDepo = { randevu: Randevu[]; kapali: Kapali[]; kasa: KasaKaydi[] };

const kure = globalThis as unknown as { __salonkolayDepo?: BellekDepo };
kure.__salonkolayDepo ??= { randevu: [], kapali: [], kasa: [] };

const bellekRandevu = kure.__salonkolayDepo.randevu;
const bellekKapali = kure.__salonkolayDepo.kapali;
const bellekKasa = kure.__salonkolayDepo.kasa;

/* ───────────────────────── randevular ───────────────────────── */

type RandevuSatir = {
  id: string;
  salon: string;
  gun: string;
  baslangic: number;
  dakika: number;
  personel_id: string;
  hizmet_ids: string[];
  ad: string;
  telefon: string;
  notu: string | null;
  durum: Randevu["durum"];
  kaynak: string;
  olusturma: string;
};

function satirdanRandevu(s: RandevuSatir): Randevu {
  return {
    id: s.id,
    salon: s.salon,
    gun: s.gun,
    baslangic: s.baslangic,
    dakika: s.dakika,
    personelId: s.personel_id,
    hizmetIds: s.hizmet_ids,
    ad: s.ad,
    telefon: s.telefon,
    not: s.notu ?? undefined,
    durum: s.durum,
    kaynak: (s.kaynak as Randevu["kaynak"]) ?? "web",
    olusturma: Number(s.olusturma),
  };
}

export async function salonunRandevulari(salon: string): Promise<Randevu[]> {
  if (!pgVarMi()) return bellekRandevu.filter((r) => r.salon === salon);
  const satirlar = await sorgu<RandevuSatir>(
    `select * from randevular where salon = $1 order by gun, baslangic`,
    [salon]
  );
  return satirlar.map(satirdanRandevu);
}

export async function gununRandevulari(salon: string, gun: string): Promise<Randevu[]> {
  if (!pgVarMi())
    return bellekRandevu
      .filter((r) => r.salon === salon && r.gun === gun)
      .sort((a, b) => a.baslangic - b.baslangic);
  const satirlar = await sorgu<RandevuSatir>(
    `select * from randevular where salon = $1 and gun = $2 order by baslangic`,
    [salon, gun]
  );
  return satirlar.map(satirdanRandevu);
}

export async function araliktakiRandevular(
  salon: string,
  bas: string,
  son: string
): Promise<Randevu[]> {
  if (!pgVarMi())
    return bellekRandevu
      .filter((r) => r.salon === salon && r.gun >= bas && r.gun <= son)
      .sort((a, b) => a.gun.localeCompare(b.gun) || a.baslangic - b.baslangic);
  const satirlar = await sorgu<RandevuSatir>(
    `select * from randevular where salon = $1 and gun between $2 and $3 order by gun, baslangic`,
    [salon, bas, son]
  );
  return satirlar.map(satirdanRandevu);
}

export async function randevuEkle(
  r: Omit<Randevu, "id" | "olusturma" | "durum"> & { durum?: Randevu["durum"] }
): Promise<Randevu> {
  const yeni: Randevu = {
    ...r,
    id: kimlikUret(),
    durum: r.durum ?? "bekliyor",
    kaynak: r.kaynak ?? "web",
    olusturma: Date.now(),
  };
  if (!pgVarMi()) {
    bellekRandevu.push(yeni);
    return yeni;
  }
  await sorgu(
    `insert into randevular
       (id, salon, gun, baslangic, dakika, personel_id, hizmet_ids, ad, telefon, notu, durum, kaynak, olusturma)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      yeni.id,
      yeni.salon,
      yeni.gun,
      yeni.baslangic,
      yeni.dakika,
      yeni.personelId,
      yeni.hizmetIds,
      yeni.ad,
      yeni.telefon,
      yeni.not ?? null,
      yeni.durum,
      yeni.kaynak,
      yeni.olusturma,
    ]
  );
  return yeni;
}

export async function durumDegistir(
  salon: string,
  id: string,
  durum: Randevu["durum"]
): Promise<void> {
  if (!pgVarMi()) {
    const r = bellekRandevu.find((x) => x.id === id && x.salon === salon);
    if (r) r.durum = durum;
    return;
  }
  await sorgu(`update randevular set durum = $3 where salon = $1 and id = $2`, [salon, id, durum]);
}

/**
 * Randevunun gününü ve saatini değiştirir (erteleme).
 *
 * Personel değişmiyor: müşteri saati kaydırırken "kimden" seçimini de
 * yeniden yapmak zorunda kalmasın. Çakışma kontrolü çağıran tarafta.
 */
export async function randevuErtele(
  salon: string,
  id: string,
  gun: string,
  baslangic: number
): Promise<void> {
  if (!pgVarMi()) {
    const r = bellekRandevu.find((x) => x.id === id && x.salon === salon);
    if (r) {
      r.gun = gun;
      r.baslangic = baslangic;
    }
    return;
  }
  await sorgu(`update randevular set gun = $3, baslangic = $4 where salon = $1 and id = $2`, [
    salon,
    id,
    gun,
    baslangic,
  ]);
}

export async function randevuBul(salon: string, id: string): Promise<Randevu | undefined> {
  if (!pgVarMi()) return bellekRandevu.find((x) => x.id === id && x.salon === salon);
  const satirlar = await sorgu<RandevuSatir>(
    `select * from randevular where salon = $1 and id = $2`,
    [salon, id]
  );
  return satirlar[0] ? satirdanRandevu(satirlar[0]) : undefined;
}

/* ───────────────────────── kapalı saatler ───────────────────────── */

export async function salonunKapaliklari(salon: string): Promise<Kapali[]> {
  if (!pgVarMi()) return bellekKapali.filter((k) => k.salon === salon);
  const satirlar = await sorgu<{
    id: string;
    salon: string;
    gun: string;
    baslangic: number | null;
    bitis: number | null;
    sebep: string | null;
  }>(`select * from kapaliklar where salon = $1 order by gun, baslangic nulls first`, [salon]);
  return satirlar.map((s) => ({ ...s, sebep: s.sebep ?? undefined }));
}

export async function kapaliEkle(k: Omit<Kapali, "id">): Promise<Kapali> {
  const yeni: Kapali = { ...k, id: kimlikUret() };
  if (!pgVarMi()) {
    bellekKapali.push(yeni);
    return yeni;
  }
  await sorgu(
    `insert into kapaliklar (id, salon, gun, baslangic, bitis, sebep) values ($1,$2,$3,$4,$5,$6)`,
    [yeni.id, yeni.salon, yeni.gun, yeni.baslangic, yeni.bitis, yeni.sebep ?? null]
  );
  return yeni;
}

export async function kapaliSil(salon: string, id: string): Promise<void> {
  if (!pgVarMi()) {
    const i = bellekKapali.findIndex((k) => k.id === id && k.salon === salon);
    if (i >= 0) bellekKapali.splice(i, 1);
    return;
  }
  await sorgu(`delete from kapaliklar where salon = $1 and id = $2`, [salon, id]);
}

/* ───────────────────────── kasa ───────────────────────── */

export async function kasaKayitlari(salon: string, ayOneki: string): Promise<KasaKaydi[]> {
  // ayOneki: "2026-10"
  if (!pgVarMi())
    return bellekKasa
      .filter((k) => k.salon === salon && k.gun.startsWith(ayOneki))
      .sort((a, b) => b.gun.localeCompare(a.gun) || b.olusturma - a.olusturma);
  const satirlar = await sorgu<{
    id: string;
    salon: string;
    gun: string;
    tur: "gelir" | "gider";
    tutar: string;
    aciklama: string | null;
    randevu_id: string | null;
    olusturma: string;
  }>(
    `select * from kasa where salon = $1 and gun like $2 order by gun desc, olusturma desc`,
    [salon, ayOneki + "%"]
  );
  return satirlar.map((s) => ({
    id: s.id,
    salon: s.salon,
    gun: s.gun,
    tur: s.tur,
    tutar: Number(s.tutar),
    aciklama: s.aciklama ?? undefined,
    randevuId: s.randevu_id ?? undefined,
    olusturma: Number(s.olusturma),
  }));
}

export async function kasaEkle(k: Omit<KasaKaydi, "id" | "olusturma">): Promise<KasaKaydi> {
  const yeni: KasaKaydi = { ...k, id: kimlikUret(), olusturma: Date.now() };
  if (!pgVarMi()) {
    bellekKasa.push(yeni);
    return yeni;
  }
  await sorgu(
    `insert into kasa (id, salon, gun, tur, tutar, aciklama, randevu_id, olusturma)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      yeni.id,
      yeni.salon,
      yeni.gun,
      yeni.tur,
      yeni.tutar,
      yeni.aciklama ?? null,
      yeni.randevuId ?? null,
      yeni.olusturma,
    ]
  );
  return yeni;
}

export async function kasaSil(salon: string, id: string): Promise<void> {
  if (!pgVarMi()) {
    const i = bellekKasa.findIndex((k) => k.id === id && k.salon === salon);
    if (i >= 0) bellekKasa.splice(i, 1);
    return;
  }
  await sorgu(`delete from kasa where salon = $1 and id = $2`, [salon, id]);
}

/** Bu randevu kasaya daha önce yazıldı mı? */
export async function kasadaVarMi(salon: string, randevuId: string): Promise<boolean> {
  if (!pgVarMi()) return bellekKasa.some((k) => k.salon === salon && k.randevuId === randevuId);
  const satirlar = await sorgu<{ id: string }>(
    `select id from kasa where salon = $1 and randevu_id = $2 limit 1`,
    [salon, randevuId]
  );
  return satirlar.length > 0;
}

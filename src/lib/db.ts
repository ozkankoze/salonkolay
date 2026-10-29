/**
 * VERİTABANI BAĞLANTISI
 *
 * DATABASE_URL varsa Postgres (Neon) kullanılır.
 * Yoksa sistem bellekte çalışmaya devam eder — demo bozulmaz,
 * sadece sunucu yeniden başlayınca veriler sıfırlanır.
 *
 * Bu dosyanın dışında hiçbir yerde "pg" import edilmez.
 */

import { Pool } from "pg";

let havuz: Pool | null = null;
let kurulumSozu: Promise<void> | null = null;

export function pgVarMi(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function havuzAl(): Pool {
  if (!havuz) {
    havuz = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return havuz;
}

/** Şemayı kurar. Birden fazla çağrılsa da bir kez çalışır. */
export function kur(): Promise<void> {
  if (!kurulumSozu) kurulumSozu = semaKur();
  return kurulumSozu;
}

async function semaKur(): Promise<void> {
  const h = havuzAl();
  await h.query(`
    create table if not exists salonlar (
      slug        text primary key,
      veri        jsonb       not null,
      sifre_hash  text        not null,
      guncelleme  timestamptz not null default now()
    );

    create table if not exists randevular (
      id          text        primary key,
      salon       text        not null,
      gun         text        not null,
      baslangic   int         not null,
      dakika      int         not null,
      personel_id text        not null,
      hizmet_ids  text[]      not null,
      ad          text        not null,
      telefon     text        not null,
      notu        text,
      durum       text        not null default 'bekliyor',
      kaynak      text        not null default 'web',
      olusturma   bigint      not null
    );
    create index if not exists randevular_salon_gun on randevular (salon, gun);

    create table if not exists kapaliklar (
      id        text primary key,
      salon     text not null,
      gun       text not null,
      baslangic int,
      bitis     int,
      sebep     text
    );
    create index if not exists kapaliklar_salon_gun on kapaliklar (salon, gun);

    create table if not exists kasa (
      id         text        primary key,
      salon      text        not null,
      gun        text        not null,
      tur        text        not null,
      tutar      numeric(12,2) not null,
      aciklama   text,
      randevu_id text,
      olusturma  bigint      not null
    );
    create index if not exists kasa_salon_gun on kasa (salon, gun);
  `);
}

export async function sorgu<T = Record<string, unknown>>(
  metin: string,
  degerler: unknown[] = []
): Promise<T[]> {
  await kur();
  const sonuc = await havuzAl().query(metin, degerler);
  return sonuc.rows as T[];
}

/** Rastgele, kısa, çakışmayan kimlik. */
export function kimlikUret(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

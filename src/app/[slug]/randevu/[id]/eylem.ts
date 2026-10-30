"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  durumDegistir,
  randevuBul,
  randevuErtele,
  salonunKapaliklari,
  salonunRandevulari,
} from "@/lib/depo";
import { randevuImzaDogru } from "@/lib/sifre";
import { anahtarGun, dkCevir, yerUygunMu } from "@/lib/saat";
import { salonGetir } from "@/lib/salonVeri";
import { erteleBildir, iptalBildir } from "@/lib/bildirim";
import { simdiTR } from "@/lib/zaman";
import { dilAyikla, sozluk } from "@/lib/dil";

/**
 * Müşterinin kendi randevusunu iptal etmesi.
 *
 * Kimlik tek başına yetmez; bağlantıdaki imza doğrulanır. Geçmiş bir
 * randevu iptal edilemez — o saat zaten yaşandı.
 */
export async function iptalEylem(_onceki: string | null, veri: FormData): Promise<string | null> {
  const slug = String(veri.get("salon") ?? "");
  const id = String(veri.get("id") ?? "");
  const anahtar = String(veri.get("anahtar") ?? "");
  const t = sozluk(dilAyikla(veri.get("dil")) ?? "tr");

  if (!randevuImzaDogru(id, anahtar)) return t.baglantiGecersiz;

  const r = await randevuBul(slug, id);
  if (!r) return t.randevuBulunamadi;
  if (r.durum === "iptal") return "tamam";

  const an = anahtarGun(r.gun);
  an.setHours(Math.floor(r.baslangic / 60), r.baslangic % 60, 0, 0);
  if (an.getTime() < Date.now()) return t.saatiGecmis;

  await durumDegistir(slug, id, "iptal");

  const salon = await salonGetir(slug);
  if (salon) after(() => iptalBildir(salon, r));

  revalidatePath(`/${slug}/randevu/${id}`);
  return "tamam";
}

/**
 * Müşterinin kendi randevusunu başka bir saate taşıması.
 *
 * İptal + yeniden alma yerine tek adım: eski saat serbest kalır, yeni
 * saat aynı kişiye kurulur. Çakışma kontrolü burada yapılır — istemciye
 * güvenilmez, istek doğrudan da gelebilir.
 */
export async function erteleEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = String(veri.get("salon") ?? "");
  const id = String(veri.get("id") ?? "");
  const anahtar = String(veri.get("anahtar") ?? "");
  const gun = String(veri.get("gun") ?? "");
  const saat = String(veri.get("saat") ?? "");
  const t = sozluk(dilAyikla(veri.get("dil")) ?? "tr");

  if (!randevuImzaDogru(id, anahtar)) return t.baglantiGecersiz;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun) || !/^\d{2}:\d{2}$/.test(saat)) return t.saatDoldu;

  const [salon, r] = await Promise.all([salonGetir(slug), randevuBul(slug, id)]);
  if (!salon || !r) return t.randevuBulunamadi;
  if (r.durum === "iptal") return t.randevuBulunamadi;

  const eski = anahtarGun(r.gun);
  eski.setHours(Math.floor(r.baslangic / 60), r.baslangic % 60, 0, 0);
  if (eski.getTime() < simdiTR().getTime()) return t.saatiGecmis;

  const baslangic = dkCevir(saat);
  const yeni = anahtarGun(gun);
  yeni.setHours(Math.floor(baslangic / 60), baslangic % 60, 0, 0);
  if (yeni.getTime() < simdiTR().getTime()) return t.saatDoldu;

  const [mevcut, kapaliklar] = await Promise.all([
    salonunRandevulari(slug),
    salonunKapaliklari(slug),
  ]);
  // Randevunun kendisi çakışma sayılmasın.
  const digerleri = mevcut.filter((x) => x.id !== id);
  if (!yerUygunMu(salon, gun, baslangic, r.dakika, r.personelId, digerleri, kapaliklar))
    return t.saatDoldu;

  await randevuErtele(slug, id, gun, baslangic);

  const guncel = { ...r, gun, baslangic };
  after(() => erteleBildir(salon, r, guncel));

  revalidatePath(`/${slug}/randevu/${id}`);
  return "tamam";
}

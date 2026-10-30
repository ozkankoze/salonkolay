"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { durumDegistir, randevuBul } from "@/lib/depo";
import { randevuImzaDogru } from "@/lib/sifre";
import { anahtarGun } from "@/lib/saat";
import { salonGetir } from "@/lib/salonVeri";
import { iptalBildir } from "@/lib/bildirim";
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

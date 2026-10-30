"use server";

import { revalidatePath } from "next/cache";
import { durumDegistir, randevuBul } from "@/lib/depo";
import { randevuImzaDogru } from "@/lib/sifre";
import { anahtarGun } from "@/lib/saat";

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

  if (!randevuImzaDogru(id, anahtar)) return "Bağlantı geçersiz.";

  const r = await randevuBul(slug, id);
  if (!r) return "Randevu bulunamadı.";
  if (r.durum === "iptal") return "tamam";

  const an = anahtarGun(r.gun);
  an.setHours(Math.floor(r.baslangic / 60), r.baslangic % 60, 0, 0);
  if (an.getTime() < Date.now()) return "Bu randevunun saati geçmiş. Salonu arayın.";

  await durumDegistir(slug, id, "iptal");
  revalidatePath(`/${slug}/randevu/${id}`);
  return "tamam";
}

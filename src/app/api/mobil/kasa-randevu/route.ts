import { kasaEkle, kasadaVarMi, durumDegistir, randevuBul } from "@/lib/depo";
import { govdeOku, hata, istekSalonu, jsonCevap } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * RANDEVUYU KASAYA YAZMA
 *
 * POST { id } -> { tutar, aciklama }
 *
 * Panelin `kasayaYazEylem` fonksiyonunun birebir karşılığı: tutarı
 * hizmet fiyatlarından toplar, kasaya gelir olarak yazar ve randevuyu
 * "geldi" yapar. İki tarafta iki ayrı hesap olmasın diye aynı sıra.
 *
 * ⚠️ İKİ KERE YAZMIYOR. `kasadaVarMi` ile kontrol ediyoruz; salon
 * panelden yazdıktan sonra telefondan bir daha basarsa gün iki katı
 * ciro göstermemeli.
 *
 * ⚠️ FİYATI OLMAYAN HİZMET 0 SAYILIYOR. "Saç boyası" gibi fiyatı
 * saça göre değişen hizmetlerde tutar eksik çıkabiliyor; salon kasadan
 * elle düzeltiyor. Uydurma bir rakam yazmaktansa eksik yazmak iyi.
 */
export async function POST(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const id = String(g.id ?? "").trim();
  if (!id) return hata("Randevu kimliği gerekli.", 400);

  const randevu = await randevuBul(salon.slug, id);
  if (!randevu) return hata("Randevu bulunamadı.", 404);
  if (randevu.durum === "iptal") return hata("İptal edilmiş randevu kasaya yazılmaz.", 400);

  if (await kasadaVarMi(salon.slug, id)) {
    return hata("Bu randevu zaten kasada.", 409);
  }

  const hizmetler = salon.hizmetler.filter((h) => randevu.hizmetIds.includes(h.id));
  const tutar = hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0);
  const aciklama = `${randevu.ad} — ${hizmetler.map((h) => h.ad).join(", ")}`;

  await kasaEkle({
    salon: salon.slug,
    gun: randevu.gun,
    tur: "gelir",
    tutar,
    aciklama,
    randevuId: randevu.id,
  });
  await durumDegistir(salon.slug, id, "geldi");

  return jsonCevap({ tutar, aciklama });
}

/**
 * KATEGORİLER
 *
 * Salonkolay'ın kendi sayfalarında (ana sayfa, keşfet) kullanılan
 * hizmet kategorileri. Salon sayfalarını ilgilendirmez — oradaki
 * gruplama `hizmet.grup` ile yapılıyor, o ayrı bir şey.
 *
 * ⚠️ KATEGORİ KARTLARI FOTOĞRAFSIZ. Elimizde yalnız Pınar Kuaför'ün
 * fotoğrafları var. Altı kategoriyi altı ayrı stok fotoğrafla
 * süslemek, platformda olmayan salonların varmış gibi görünmesine
 * yol açardı. Onun yerine her kategorinin kendi rengi ve çizimi var.
 */

import type { Salon } from "./salon";
import type { Dil } from "./dil";

export type Kategori = {
  slug: string;
  ad: string;
  adEn: string;
  /** Kartın altındaki tek satırlık tarif. */
  alt: string;
  altEn: string;
  /** Kart zemini — sıcak bej ailesinden, birbirinden ayrılsın diye. */
  zemin: string;
  /** Çizim ve vurgu rengi. */
  muren: string;
  /** Kart çizimi: 48x48 kutuya sığan, tek renk, ince çizgi. */
  cizim: string;
};

export const KATEGORILER: Kategori[] = [
  {
    slug: "kadin-kuaforu",
    ad: "Kadın Kuaförü",
    adEn: "Women’s Hair",
    alt: "Kesim, renk, bakım",
    altEn: "Cuts, colour, care",
    zemin: "#F4E9E6",
    muren: "#9B4A5A",
    // el aynası: daire + sap. Ampule benzemesin diye sap uzun ve altta kaide var.
    cizim:
      "M24 6a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21ZM18.5 15.5a6 6 0 0 1 4.3-4.1M24 27.5V40M19.5 42h9",
  },
  {
    slug: "erkek-berberi",
    ad: "Erkek Berberi",
    adEn: "Barber",
    alt: "Saç, sakal, tıraş",
    altEn: "Hair, beard, shave",
    zemin: "#E9E7E1",
    muren: "#4A4A42",
    cizim:
      "M13 11l22 22M35 11L13 33M13 33a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM35 33a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z",
  },
  {
    slug: "tirnak",
    ad: "Tırnak & Nail Art",
    adEn: "Nails & Nail Art",
    alt: "Manikür, pedikür, protez",
    altEn: "Manicure, pedicure, extensions",
    zemin: "#F3E6EC",
    muren: "#A4476F",
    cizim:
      "M24 7c5 0 8.5 3.3 8.5 8v17c0 5.5-3.8 9-8.5 9s-8.5-3.5-8.5-9V15c0-4.7 3.5-8 8.5-8ZM15.5 24h17",
  },
  {
    slug: "cilt-bakimi",
    ad: "Cilt Bakımı",
    adEn: "Skin Care",
    alt: "Temizlik, peeling, maske",
    altEn: "Cleansing, peeling, masks",
    zemin: "#EAEDE6",
    muren: "#4E6347",
    cizim:
      "M24 41c8.3 0 15-6.7 15-15 0-9-7.8-16-15-19C16.8 10 9 17 9 26c0 8.3 6.7 15 15 15ZM17 27c0-4.4 3.1-8 7-8",
  },
  {
    slug: "kas-kirpik",
    ad: "Kaş & Kirpik",
    adEn: "Brows & Lashes",
    alt: "Lifting, laminasyon, tasarım",
    altEn: "Lifting, lamination, shaping",
    zemin: "#F1EAE0",
    muren: "#8A6338",
    cizim:
      "M8 28c4.8-7 10.3-10.5 16-10.5S35.2 21 40 28M24 17.5V12M13.5 21l-3-4.5M34.5 21l3-4.5M24 38a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
  },
  {
    slug: "masaj-spa",
    ad: "Masaj & Spa",
    adEn: "Massage & Spa",
    alt: "Masaj, hamam, ritüel",
    altEn: "Massage, hammam, rituals",
    zemin: "#E6EBEC",
    muren: "#3F5A5E",
    cizim:
      "M24 38c7 0 13-4.6 15-11-6-2-11.6.3-15 5-3.4-4.7-9-7-15-5 2 6.4 8 11 15 11ZM24 38V21M24 21c0-5 2.5-8.5 6-10-1 5-3 8-6 10ZM24 21c0-5-2.5-8.5-6-10 1 5 3 8 6 10Z",
  },
];

export function kategoriBul(slug: string): Kategori | undefined {
  return KATEGORILER.find((k) => k.slug === slug);
}

export function kategoriAdi(k: Kategori, dil: Dil): string {
  return dil === "en" ? k.adEn : k.ad;
}

export function kategoriAlt(k: Kategori, dil: Dil): string {
  return dil === "en" ? k.altEn : k.alt;
}

/** Salonun kategorileri — tanımsızsa boş dizi. */
export function salonKategorileri(s: Salon): Kategori[] {
  return (s.kategoriler ?? []).map(kategoriBul).filter((k): k is Kategori => !!k);
}

/** O kategoride salon var mı — boş kategori kartı dürüstçe işaretlenir. */
export function kategoriSalonSayisi(salonlar: Salon[], slug: string): number {
  return salonlar.filter((s) => (s.kategoriler ?? []).includes(slug)).length;
}

/**
 * Keşfet sayfasının aramasını çalıştırır.
 *
 * Salon adı, sloganı, adresi ve hizmet adları taranıyor; hizmet adının
 * da taranması önemli, çünkü insan "balyaj" yazıp salon arıyor.
 */
export function salonAra(
  salonlar: Salon[],
  opts: { metin?: string; kategori?: string; dil: Dil },
): Salon[] {
  const q = (opts.metin ?? "").trim().toLocaleLowerCase("tr");
  const kat = opts.kategori;

  return salonlar.filter((s) => {
    if (kat && !(s.kategoriler ?? []).includes(kat)) return false;
    if (!q) return true;

    const havuz = [
      s.ad,
      s.slogan ?? "",
      s.sloganEn ?? "",
      s.adres ?? "",
      ...s.hizmetler.map((h) => h.ad),
      ...s.hizmetler.map((h) => h.adEn ?? ""),
      ...s.hizmetler.map((h) => h.grup ?? ""),
      ...salonKategorileri(s).flatMap((k) => [k.ad, k.adEn]),
    ]
      .join(" ")
      .toLocaleLowerCase("tr");

    return havuz.includes(q);
  });
}

/** Adres dizesinin sonundaki ili çıkarır: "… Kadıköy / İstanbul" -> "İstanbul" */
export function sehirYaz(s: Salon): string | null {
  if (!s.adres) return null;
  const parcalar = s.adres.split("/").map((x) => x.trim()).filter(Boolean);
  return parcalar.length > 1 ? parcalar[parcalar.length - 1] : null;
}

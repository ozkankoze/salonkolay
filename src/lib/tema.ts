/**
 * SALON TEMALARI
 *
 * Her salonun sitesi dört renkten ibaret: vurgu, koyu metin, sayfa
 * zemini ve kart zemini. Tema bu dördünün hazır bir takımı.
 *
 * Seçim panelde yapılınca renkler salonun kendi kaydına yazılır —
 * sayfalar eskisi gibi `s.renk`, `s.koyu` okumaya devam eder, tema
 * diye ayrı bir katman yok. `tema` alanı sadece panelde hangi kartın
 * işaretli duracağını bilmek için tutuluyor.
 */

export type Tema = {
  id: string;
  ad: string;
  adEn: string;
  aciklama: string;
  aciklamaEn: string;
  renk: string;
  koyu: string;
  zemin: string;
  acikZemin: string;
};

export const TEMALAR: Tema[] = [
  {
    id: "pembe",
    ad: "Yumuşak Pembe",
    adEn: "Soft Pink",
    aciklama: "Kuaför ve güzellik salonları için sıcak, tanıdık bir görünüm.",
    aciklamaEn: "A warm, familiar look for hair and beauty salons.",
    renk: "#B84A6E",
    koyu: "#46202F",
    zemin: "#FDF6F8",
    acikZemin: "#FFFFFF",
  },
  {
    id: "bej",
    ad: "Luxury Beige",
    adEn: "Luxury Beige",
    aciklama: "Bakımlı ve pahalı duran bej-altın. Güzellik merkezlerine yakışır.",
    aciklamaEn: "Polished beige and gold. Suits beauty studios.",
    renk: "#A8853F",
    koyu: "#3B3225",
    zemin: "#FAF6EF",
    acikZemin: "#FFFDF8",
  },
  {
    id: "siyah",
    ad: "Editorial Black",
    adEn: "Editorial Black",
    aciklama: "Keskin siyah-beyaz, dergi kapağı hissi. Erkek kuaförlerinde güçlü durur.",
    aciklamaEn: "Sharp black and white, magazine feel. Strong for barbers.",
    renk: "#1A1A1A",
    koyu: "#0E0E0E",
    zemin: "#F4F4F3",
    acikZemin: "#FFFFFF",
  },
  {
    id: "adaci",
    ad: "Natural Sage",
    adEn: "Natural Sage",
    aciklama: "Sakin yeşil tonları. Doğal bakım ve spa tarafına uyar.",
    aciklamaEn: "Calm greens. Fits natural care and spa.",
    renk: "#5C7A62",
    koyu: "#28352A",
    zemin: "#F3F6F2",
    acikZemin: "#FFFFFF",
  },
];

export function temaBul(id: string | undefined): Tema | undefined {
  return TEMALAR.find((t) => t.id === id);
}

/**
 * SESLİ RANDEVU — Türkçe cümle çözümleyici.
 *
 * "Ayşe saat 13:00 randevu"        -> { ad: "Ayşe", saat: "13:00" }
 * "Merve yarın üç buçukta kesim"   -> { ad: "Merve", gun: yarın, saat: "15:30", hizmet: kesim }
 * "Zeynep cumartesi 11 de fön"     -> { ad: "Zeynep", gun: cumartesi, saat: "11:00", hizmet: fön }
 *
 * Tamamen kural tabanlı ve saf: ağ yok, yapay zekâ yok, test edilebilir.
 * Sonuç kullanıcıya DOLDURULMUŞ FORM olarak gösterilir — doğrudan kaydedilmez.
 * Ses tanıma özellikle özel isimlerde yanılıyor; son sözü salon sahibi söyler.
 */

import type { Salon } from "./salon";
import { anahtarGun, gunAnahtar } from "./saat";

export type Cozum = {
  ad?: string;
  gun?: string;
  saat?: string;
  hizmetIds: string[];
  personelId?: string;
  /** Kullanıcıya "şunu anladım" diye gösterilecek parçalar. */
  anlasilan: string[];
};

/* ───────────────────── metin yardımcıları ───────────────────── */

/**
 * Türkçe'ye duyarlı küçük harf + noktalama temizliği.
 *
 * Rakamların arasındaki ayraç KORUNUR: "14:30" ve "14.30" saat olarak
 * okunacak, "14 30" diye ikiye bölünmeyecek.
 */
export function sade(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[’'`]/g, "")
    .replace(/(\d)\s*[.:]\s*(\d)/g, "$1:$2")
    .replace(/[.,!?;]/g, " ")
    .replace(/:(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tek kelimeyi sadeleştirir — dizi hizası bozulmadan. */
function sadeKelime(k: string): string {
  return k
    .toLocaleLowerCase("tr")
    .replace(/[’'`]/g, "")
    .replace(/[.,!?;]$/, "");
}

const SAYI: Record<string, number> = {
  sıfır: 0, bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7,
  sekiz: 8, dokuz: 9, on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50,
};

/** "üçte" -> "üç", "birde" -> "bir", "buçukta" -> "buçuk" */
function ekAt(kelime: string): string {
  for (const ek of ["da", "de", "ta", "te"]) {
    if (kelime.length > ek.length + 1 && kelime.endsWith(ek)) {
      const kok = kelime.slice(0, -ek.length);
      // "dörtte" -> "dört", "sekizde" -> "sekiz"
      if (SAYI[kok] !== undefined || kok === "buçuk" || kok === "çeyrek") return kok;
      // çift ünsüz: "dörtte" -> "dört" zaten yukarıda; "onbirde" gibi birleşikler
      if (SAYI[kok.replace(/(.)\1$/, "$1")] !== undefined) return kok.replace(/(.)\1$/, "$1");
    }
  }
  return kelime;
}

/** Sayı kelimesi mi? "on bir" gibi iki kelimelik olanlar için sonraki kelimeye de bakar. */
function sayiOku(kelimeler: string[], i: number): { deger: number; adim: number } | null {
  const k = ekAt(kelimeler[i]);

  if (/^\d{1,2}$/.test(k)) return { deger: Number(k), adim: 1 };

  if (SAYI[k] === undefined) return null;
  const temel = SAYI[k];

  // "on bir", "yirmi beş"
  if (temel >= 10 && i + 1 < kelimeler.length) {
    const sonraki = ekAt(kelimeler[i + 1]);
    const birler = SAYI[sonraki];
    if (birler !== undefined && birler < 10 && birler > 0)
      return { deger: temel + birler, adim: 2 };
  }
  return { deger: temel, adim: 1 };
}

/* ───────────────────── saat ───────────────────── */

const SABAH = /\b(sabah|sabahleyin)\b/;
const OGLEDEN = /\b(öğleden sonra|öğleden|akşam|akşamüstü|ikindi)\b/;

/**
 * Salonlar 09:00–20:00 arası çalışıyor. "üçte" denince 03:00 değil 15:00
 * kastedilir. 8'den küçük saatleri öğleden sonraya çeviriyoruz;
 * "sabah" dendiyse çevirmiyoruz.
 */
function saatDuzelt(sa: number, metin: string): number {
  if (SABAH.test(metin)) return sa;
  if (OGLEDEN.test(metin) && sa < 12) return sa + 12;
  if (sa >= 1 && sa < 8) return sa + 12;
  return sa;
}

/** Cümleden saati bulur, kullandığı kelimelerin indekslerini de döner. */
function saatBul(
  kelimeler: string[],
  metin: string
): { saat: string; kullanilan: Set<number> } | null {
  const kullanilan = new Set<number>();

  // 1) 13:00 / 13.30 / 1330 biçimleri
  for (let i = 0; i < kelimeler.length; i++) {
    const m = ekAt(kelimeler[i]).match(/^(\d{1,2})[:.](\d{2})$/);
    if (m) {
      const sa = Number(m[1]);
      const dk = Number(m[2]);
      if (sa <= 23 && dk <= 59) {
        kullanilan.add(i);
        if (i > 0 && kelimeler[i - 1] === "saat") kullanilan.add(i - 1);
        return { saat: yaz(saatDuzelt(sa, metin), dk), kullanilan };
      }
    }
  }

  // 2) sayı (+ buçuk / çeyrek / dakika)
  for (let i = 0; i < kelimeler.length; i++) {
    if (kelimeler[i] === "saat") continue;
    const s = sayiOku(kelimeler, i);
    if (!s || s.deger > 23) continue;

    // Takip eden kelimeler saat olduğunu doğruluyor mu?
    const sonraki = kelimeler[i + s.adim] ? ekAt(kelimeler[i + s.adim]) : "";
    const oncekiSaat = i > 0 && kelimeler[i - 1] === "saat";
    const kendiEki = /(da|de|ta|te)$/.test(kelimeler[i + s.adim - 1]);

    let dk = 0;
    let adim = s.adim;
    if (sonraki === "buçuk") {
      dk = 30;
      adim += 1;
    } else if (sonraki === "çeyrek") {
      dk = 15;
      adim += 1;
    } else if (!oncekiSaat && !kendiEki) {
      // "Ayşe 3 kesim" gibi belirsiz durumlarda sayıyı saat saymıyoruz,
      // ancak cümlede başka saat adayı yoksa son çare olarak kabul edilir.
      const baskaIpucu = /\b(saat|buçuk|çeyrek)\b/.test(metin);
      if (baskaIpucu) continue;
    }

    for (let j = i; j < i + adim; j++) kullanilan.add(j);
    if (oncekiSaat) kullanilan.add(i - 1);
    return { saat: yaz(saatDuzelt(s.deger, metin), dk), kullanilan };
  }

  return null;
}

function yaz(sa: number, dk: number): string {
  return `${String(sa).padStart(2, "0")}:${String(dk).padStart(2, "0")}`;
}

/* ───────────────────── gün ───────────────────── */

const HAFTA = ["pazar", "pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi"];
const AYLAR = [
  "ocak", "şubat", "mart", "nisan", "mayıs", "haziran",
  "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık",
];

function gunBul(
  kelimeler: string[],
  bugun: Date
): { gun: string; kullanilan: Set<number> } | null {
  const kullanilan = new Set<number>();
  const kaydir = (n: number) => {
    const d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + n);
    return gunAnahtar(d);
  };

  for (let i = 0; i < kelimeler.length; i++) {
    const k = kelimeler[i];

    if (k === "bugün") return { gun: kaydir(0), kullanilan: new Set([i]) };
    if (k === "yarın") return { gun: kaydir(1), kullanilan: new Set([i]) };
    if (k === "öbür" && kelimeler[i + 1]?.startsWith("gün"))
      return { gun: kaydir(2), kullanilan: new Set([i, i + 1]) };

    // Hafta günü (ekli hâlleriyle: cumartesiye, pazartesi günü).
    // Uzun adlar önce denenir: "cumartesi" yanlışlıkla "cuma" sayılmasın,
    // "pazartesi" de "pazar" sayılmasın.
    const sirali = HAFTA.map((g, idx) => ({ g, idx })).sort((a, b) => b.g.length - a.g.length);
    const eslesen = sirali.find(({ g }) => k === g || k.startsWith(g));
    if (eslesen) {
      let fark = (eslesen.idx - bugun.getDay() + 7) % 7;
      if (fark === 0) fark = 7; // "cumartesi" bugünse haftaya
      kullanilan.add(i);
      if (kelimeler[i + 1]?.startsWith("gün")) kullanilan.add(i + 1);
      return { gun: kaydir(fark), kullanilan };
    }

    // "3 kasım"
    const s = sayiOku(kelimeler, i);
    if (s && s.deger >= 1 && s.deger <= 31) {
      const ayAdi = kelimeler[i + s.adim];
      const ay = ayAdi ? AYLAR.findIndex((a) => ayAdi.startsWith(a)) : -1;
      if (ay >= 0) {
        let yil = bugun.getFullYear();
        const aday = new Date(yil, ay, s.deger);
        if (aday < new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate())) yil += 1;
        for (let j = i; j <= i + s.adim; j++) kullanilan.add(j);
        return { gun: gunAnahtar(new Date(yil, ay, s.deger)), kullanilan };
      }
    }
  }
  return null;
}

/* ───────────────────── hizmet ve personel ───────────────────── */

/** Hizmet adının anlamlı kelimeleri + sık kullanılan kısaltmalar. */
const ESANLAM: Record<string, string[]> = {
  kesim: ["kesim", "kes", "saç kesimi", "kesimi"],
  fön: ["fön", "fon"],
  boya: ["boya", "boyası", "boyama"],
  balyaj: ["balyaj", "ombre", "röfle"],
  keratin: ["keratin"],
  maske: ["maske", "maskesi", "bakım"],
  manikür: ["manikür", "oje", "tırnak"],
  kaş: ["kaş", "kaşlar"],
};

function hizmetBul(
  kelimeler: string[],
  salon: Salon
): { ids: string[]; kullanilan: Set<number> } {
  // Önce her hizmetin cümlede hangi kelimelere denk geldiğini çıkarıyoruz.
  const adaylar = salon.hizmetler.map((h) => {
    const adParcalari = sade(h.ad)
      .split(" ")
      .filter((p) => p.length > 2 && !["ile", "ve"].includes(p));

    const ekler: string[] = [];
    for (const [anahtar, liste] of Object.entries(ESANLAM)) {
      if (adParcalari.some((p) => p.startsWith(anahtar) || anahtar.startsWith(p)))
        ekler.push(...liste);
    }

    const sozluk = [...new Set([...adParcalari, ...ekler])];
    const indeksler = new Set<number>();
    for (let i = 0; i < kelimeler.length; i++) {
      const k = kelimeler[i];
      if (
        sozluk.some(
          (a) => k === a || (k.length > 3 && a.startsWith(k)) || (a.length > 3 && k.startsWith(a))
        )
      )
        indeksler.add(i);
    }
    return { id: h.id, indeksler };
  });

  /**
   * "Keratin bakım" ile "Saç bakım maskesi" ikisi de "bakım" kelimesine
   * denk geliyor. En çok kelimesi tutan kazanır ve o kelimeleri tüketir;
   * böylece tek hizmet söylenince iki hizmet seçilmiş olmuyor.
   */
  adaylar.sort((a, b) => b.indeksler.size - a.indeksler.size);

  const kullanilan = new Set<number>();
  const ids: string[] = [];
  for (const a of adaylar) {
    const serbest = [...a.indeksler].filter((i) => !kullanilan.has(i));
    if (serbest.length === 0) continue;
    ids.push(a.id);
    serbest.forEach((i) => kullanilan.add(i));
  }

  return { ids, kullanilan };
}

function personelBul(
  kelimeler: string[],
  salon: Salon
): { id?: string; kullanilan: Set<number> } {
  const kullanilan = new Set<number>();
  for (const p of salon.personel) {
    const ad = sade(p.ad);
    for (let i = 0; i < kelimeler.length; i++) {
      // "melis", "melise", "melisin"
      if (kelimeler[i] === ad || (kelimeler[i].startsWith(ad) && kelimeler[i].length <= ad.length + 3)) {
        kullanilan.add(i);
        return { id: p.id, kullanilan };
      }
    }
  }
  return { kullanilan };
}

/* ───────────────────── ad ───────────────────── */

const ATILACAK = new Set([
  "randevu", "randevusu", "randevuya", "saat", "saate", "için", "ye", "ya", "a", "e",
  "bey", "beye", "hanım", "hanıma", "hanımefendi", "abla", "ablaya", "gün", "günü",
  "lütfen", "ekle", "yaz", "al", "olsun", "gelecek", "geliyor", "var", "bir",
  // saatin artık parçaları ve vakit belirteçleri
  "de", "da", "te", "ta", "buçuk", "çeyrek", "sularında", "civarı", "gibi",
  "sabah", "sabahleyin", "öğlen", "öğleden", "sonra", "akşam", "akşamüstü", "ikindi",
]);

function adBul(asilKelimeler: string[], kelimeler: string[], kullanilan: Set<number>): string | undefined {
  const kalan: string[] = [];
  for (let i = 0; i < kelimeler.length; i++) {
    if (kullanilan.has(i)) continue;
    if (ATILACAK.has(kelimeler[i])) continue;
    if (/^\d+$/.test(kelimeler[i])) continue;
    if (kelimeler[i].length < 2) continue;
    kalan.push(asilKelimeler[i] ?? kelimeler[i]);
  }
  if (kalan.length === 0) return undefined;

  // En fazla iki kelime (ad + soyad); ekleri kırpmıyoruz, salon sahibi düzeltir.
  return kalan
    .slice(0, 2)
    .map((k) => k.charAt(0).toLocaleUpperCase("tr") + k.slice(1))
    .join(" ");
}

/* ───────────────────── ana işlev ───────────────────── */

export function cumleCoz(
  metin: string,
  salon: Salon,
  bugun: Date = new Date(),
  varsayilanGun?: string
): Cozum {
  /**
   * `asil` ve `kelimeler` AYNI uzunlukta olmak zorunda — ad çıkarırken
   * indeksle eşleştiriyoruz. Bu yüzden ikisi de tek bir bölmeden üretiliyor;
   * "Melis'e" tek kelime kalır, "14:30" ikiye bölünmez.
   */
  const asil = metin
    .replace(/(\d)\s*[.:]\s*(\d)/g, "$1:$2")
    .replace(/[,!?;]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const kelimeler = asil.map(sadeKelime);
  const temiz = kelimeler.join(" ");

  const kullanilan = new Set<number>();
  const anlasilan: string[] = [];

  const g = gunBul(kelimeler, bugun);
  if (g) {
    g.kullanilan.forEach((i) => kullanilan.add(i));
  }

  const s = saatBul(kelimeler, temiz);
  if (s) {
    s.kullanilan.forEach((i) => kullanilan.add(i));
    anlasilan.push(`saat ${s.saat}`);
  }

  const p = personelBul(kelimeler, salon);
  p.kullanilan.forEach((i) => kullanilan.add(i));

  const h = hizmetBul(kelimeler, salon);
  h.kullanilan.forEach((i) => kullanilan.add(i));
  if (h.ids.length) {
    const adlar = salon.hizmetler.filter((x) => h.ids.includes(x.id)).map((x) => x.ad);
    anlasilan.push(adlar.join(", "));
  }

  if (p.id) {
    const kisi = salon.personel.find((x) => x.id === p.id);
    if (kisi) anlasilan.push(kisi.ad);
  }

  const ad = adBul(asil, kelimeler, kullanilan);
  if (ad) anlasilan.unshift(ad);

  return {
    ad,
    gun: g?.gun ?? varsayilanGun,
    saat: s?.saat,
    hizmetIds: h.ids,
    personelId: p.id,
    anlasilan,
  };
}

/** Çözümün randevu açmaya yetip yetmediği. */
export function eksikler(c: Cozum): string[] {
  const liste: string[] = [];
  if (!c.ad) liste.push("isim");
  if (!c.saat) liste.push("saat");
  if (c.hizmetIds.length === 0) liste.push("hizmet");
  return liste;
}

/**
 * TÜRKİYE SAATİ
 *
 * Vercel'in sunucuları UTC'de çalışır. `new Date()` orada Türkiye'den
 * üç saat geri gösterir ve bu sessiz bir hata üretir:
 *
 *   • Akşam 21:00'de sunucu saati 18:00 sanar, kapanmış saatleri
 *     randevuya açık gösterir.
 *   • Gece yarısından sonra sunucu hâlâ dünde olduğu için panelin
 *     "Bugün" ekranı dünkü randevuları gösterir.
 *
 * Bu yüzden "şu an" kavramı her yerde buradan geçer. Saat farkını elle
 * eklemiyoruz; Intl ile gerçek bölge saatini soruyoruz, yaz saati
 * uygulaması geri gelse bile doğru çalışsın.
 */

export const BOLGE = "Europe/Istanbul";

const BICIMCI = new Intl.DateTimeFormat("en-CA", {
  timeZone: BOLGE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export type AnTR = {
  /** "2026-10-30" */
  gun: string;
  saat: number;
  dakika: number;
  /** Gün başından beri geçen dakika. */
  gunIciDk: number;
  /** 0 = Pazar … 6 = Cumartesi */
  haftaGunu: number;
};

/** Verilen anın Türkiye'deki karşılığı. */
export function anTR(d: Date = new Date()): AnTR {
  const p: Record<string, string> = {};
  for (const { type, value } of BICIMCI.formatToParts(d)) p[type] = value;

  const yil = Number(p.year);
  const ay = Number(p.month);
  const gunNo = Number(p.day);
  // "24:00" bazı ortamlarda gece yarısı için dönebiliyor.
  const saat = Number(p.hour) % 24;
  const dakika = Number(p.minute);

  return {
    gun: `${p.year}-${p.month}-${p.day}`,
    saat,
    dakika,
    gunIciDk: saat * 60 + dakika,
    // Takvim gününün hafta gününü UTC üzerinden soruyoruz; böylece
    // sunucunun kendi bölgesi sonucu kaydırmıyor.
    haftaGunu: new Date(Date.UTC(yil, ay - 1, gunNo)).getUTCDay(),
  };
}

/** Türkiye'de bugünün tarihi: "2026-10-30" */
export function bugunTR(): string {
  return anTR().gun;
}

/** Türkiye'de şu an günün kaçıncı dakikası. */
export function simdiDkTR(): number {
  return anTR().gunIciDk;
}

/** Türkiye'de bugün haftanın kaçıncı günü (0 = Pazar). */
export function haftaGunuTR(): number {
  return anTR().haftaGunu;
}

/**
 * "Şu an" anlamına gelen bir Date.
 *
 * Saat alanları Türkiye saatini gösterir; `musaitSaatler` gibi
 * `getHours()` okuyan eski kodlar bu nesneyle doğru çalışır.
 * Mutlak zaman olarak kullanmayın — yalnızca yerel alanları doğrudur.
 */
export function simdiTR(): Date {
  const a = anTR();
  const [y, ay, g] = a.gun.split("-").map(Number);
  return new Date(y, ay - 1, g, a.saat, a.dakika, 0, 0);
}

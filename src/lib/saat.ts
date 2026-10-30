/**
 * Müsait saat hesabı.
 *
 * Sistemin kalbi burası: aynı personele aynı saatte iki randevu düşerse
 * salon sistemi bırakır. Bu yüzden çakışma kontrolü tek bir yerde,
 * burada yapılır ve her iki taraf (sayfa ve API) aynı fonksiyonu kullanır.
 */

import type { Calisma, Salon } from "./salon";
import { anTR, simdiTR } from "./zaman";

export type Randevu = {
  id: string;
  salon: string;
  /** "2026-11-03" */
  gun: string;
  /** Gün içindeki dakika — 09:30 => 570 */
  baslangic: number;
  dakika: number;
  personelId: string;
  hizmetIds: string[];
  ad: string;
  telefon: string;
  not?: string;
  durum: "bekliyor" | "onaylandi" | "iptal" | "geldi";
  /** Randevu nereden geldi: müşteri sayfasından mı, salon panelinden mi? */
  kaynak?: "web" | "panel";
  olusturma: number;
};

/** Salonun elle kapattığı gün veya saat aralığı. */
export type KapaliAralik = {
  gun: string;
  /** null = o gün tamamen kapalı */
  baslangic: number | null;
  bitis: number | null;
};

/** İstenen aralık, kapatılmış bir aralığa denk geliyor mu? */
export function kapaliyaDenkMi(
  gun: string,
  baslangic: number,
  sure: number,
  kapaliklar: KapaliAralik[]
): boolean {
  return kapaliklar.some((k) => {
    if (k.gun !== gun) return false;
    if (k.baslangic === null || k.bitis === null) return true; // tüm gün
    return baslangic < k.bitis && k.baslangic < baslangic + sure;
  });
}

export function dkCevir(s: string): number {
  const [a, b] = s.split(":").map(Number);
  return a * 60 + b;
}

export function saatYaz(dk: number): string {
  const s = Math.floor(dk / 60);
  const k = dk % 60;
  return `${String(s).padStart(2, "0")}:${String(k).padStart(2, "0")}`;
}

/** "2026-11-03" */
export function gunAnahtar(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function anahtarGun(s: string): Date {
  const [y, a, g] = s.split("-").map(Number);
  return new Date(y, a - 1, g);
}

export function calismaBul(salon: Salon, d: Date): Calisma | undefined {
  return salon.calisma.find((c) => c.gun === d.getDay());
}

/** İki aralık kesişiyor mu? */
function kesisiyor(b1: number, s1: number, b2: number, s2: number): boolean {
  return b1 < b2 + s2 && b2 < b1 + s1;
}

/**
 * Bir gün için müsait başlangıç saatleri.
 *
 * @param toplamDk seçilen hizmetlerin toplam süresi
 * @param personelId "farketmez" ise uygun personellerden biri yeterli
 */
export function musaitSaatler(
  salon: Salon,
  gun: string,
  toplamDk: number,
  personelId: string,
  mevcut: Randevu[],
  simdi: Date = simdiTR(),
  kapaliklar: KapaliAralik[] = []
): string[] {
  const d = anahtarGun(gun);
  const c = calismaBul(salon, d);
  if (!c || c.kapali || toplamDk <= 0) return [];

  const ac = dkCevir(c.acilis);
  const kapa = dkCevir(c.kapanis);

  const adaylar =
    personelId === "farketmez"
      ? salon.personel.map((p) => p.id)
      : [personelId];

  const gunun = mevcut.filter((r) => r.gun === gun && r.durum !== "iptal");

  // bugünse geçmiş saatleri ele — 30 dk tampon
  const bugunMu = gunAnahtar(simdi) === gun;
  const enErken = bugunMu ? simdi.getHours() * 60 + simdi.getMinutes() + 30 : 0;

  const sonuc: string[] = [];
  for (let t = ac; t + toplamDk <= kapa; t += salon.aralikDk) {
    if (t < enErken) continue;
    if (kapaliyaDenkMi(gun, t, toplamDk, kapaliklar)) continue;
    const uygunVar = adaylar.some((pid) => {
      const dolu = gunun.some(
        (r) => r.personelId === pid && kesisiyor(t, toplamDk, r.baslangic, r.dakika)
      );
      return !dolu;
    });
    if (uygunVar) sonuc.push(saatYaz(t));
  }
  return sonuc;
}

/** Randevu yazmadan hemen önceki son kontrol — yarış durumuna karşı. */
export function yerUygunMu(
  salon: Salon,
  gun: string,
  baslangic: number,
  toplamDk: number,
  personelId: string,
  mevcut: Randevu[],
  kapaliklar: KapaliAralik[] = []
): boolean {
  const d = anahtarGun(gun);
  const c = calismaBul(salon, d);
  if (!c || c.kapali) return false;
  if (baslangic < dkCevir(c.acilis)) return false;
  if (baslangic + toplamDk > dkCevir(c.kapanis)) return false;
  if (kapaliyaDenkMi(gun, baslangic, toplamDk, kapaliklar)) return false;

  return !mevcut.some(
    (r) =>
      r.gun === gun &&
      r.durum !== "iptal" &&
      r.personelId === personelId &&
      kesisiyor(baslangic, toplamDk, r.baslangic, r.dakika)
  );
}

/** "farketmez" seçildiyse o saatte boş olan ilk personeli verir. */
export function personelSec(
  salon: Salon,
  gun: string,
  baslangic: number,
  toplamDk: number,
  hizmetIds: string[],
  mevcut: Randevu[],
  kapaliklar: KapaliAralik[] = []
): string | null {
  const uygunlar = salon.personel.filter(
    (p) => !p.hizmetler || hizmetIds.every((h) => p.hizmetler!.includes(h))
  );
  for (const p of uygunlar) {
    if (yerUygunMu(salon, gun, baslangic, toplamDk, p.id, mevcut, kapaliklar)) return p.id;
  }
  return null;
}

/* ───────────────── salonun o anki durumu ───────────────── */

export type Durum =
  | { acik: true; kapanis: string }
  | { acik: false; sonraki?: { haftaGunu: number; acilis: string } };

/**
 * Salon şu an açık mı?
 *
 * "Şu an" Türkiye saatine göredir (bkz. `zaman.ts`), ziyaretçinin
 * telefonunun saatine göre değil: İstanbul'daki salon, Londra'daki
 * turistin saatine göre açılıp kapanmaz.
 *
 * Kapalıysa bir sonraki açılışı da verir; ziyaretçi "ne zaman
 * açılıyor" diye aramasın.
 */
export function salonDurumu(salon: Salon, an = anTR()): Durum {
  const bugunku = salon.calisma.find((c) => c.gun === an.haftaGunu);

  if (bugunku && !bugunku.kapali) {
    const acilis = dkCevir(bugunku.acilis);
    const kapanis = dkCevir(bugunku.kapanis);
    if (an.gunIciDk >= acilis && an.gunIciDk < kapanis)
      return { acik: true, kapanis: bugunku.kapanis };

    // Gün içindeyiz ama henüz açılmamış.
    if (an.gunIciDk < acilis)
      return { acik: false, sonraki: { haftaGunu: an.haftaGunu, acilis: bugunku.acilis } };
  }

  // Bugün kapandı ya da kapalı: ileriye doğru ilk açık günü ara.
  for (let i = 1; i <= 7; i++) {
    const g = (an.haftaGunu + i) % 7;
    const c = salon.calisma.find((x) => x.gun === g);
    if (c && !c.kapali) return { acik: false, sonraki: { haftaGunu: g, acilis: c.acilis } };
  }
  return { acik: false };
}

/** Yorumlardan hesaplanan puan ortalaması ve yorum sayısı. */
export function puanOrtalamasi(salon: Salon): { puan: number; adet: number } | null {
  const y = salon.yorumlar?.filter((x) => typeof x.puan === "number" && x.puan > 0);
  if (!y?.length) return null;
  const toplam = y.reduce((t, x) => t + x.puan, 0);
  return { puan: Math.round((toplam / y.length) * 10) / 10, adet: y.length };
}

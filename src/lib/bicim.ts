/** Panelde kullanılan küçük biçimlendirme yardımcıları. */

import { anahtarGun, gunAnahtar } from "./saat";
import { bugunTR } from "./zaman";

const AY = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** "2026-10-29" -> "29 Ekim Perşembe" */
export function gunYaz(gun: string): string {
  const d = anahtarGun(gun);
  return `${d.getDate()} ${AY[d.getMonth()]} ${GUN[d.getDay()]}`;
}

/** "2026-10-29" -> "29 Eki" */
export function kisaGun(gun: string): string {
  const d = anahtarGun(gun);
  return `${d.getDate()} ${AY[d.getMonth()].slice(0, 3)}`;
}

export function bugunAnahtar(): string {
  // Sunucu UTC'de; "bugün" Türkiye'nin bugünü olmalı.
  return bugunTR();
}

/** gun + n gün */
export function gunKaydir(gun: string, n: number): string {
  const d = anahtarGun(gun);
  d.setDate(d.getDate() + n);
  return gunAnahtar(d);
}

export function paraYaz(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " ₺";
}

/** "905370108611" -> "0537 010 86 11" */
export function telefonYaz(t: string): string {
  const s = t.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  if (s.length !== 10) return t;
  return `0${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 8)} ${s.slice(8)}`;
}

export function waLink(telefon: string, metin: string): string {
  const t = telefon.replace(/\D/g, "");
  const numara = t.startsWith("90") ? t : "90" + t.replace(/^0/, "");
  return `https://wa.me/${numara}?text=${encodeURIComponent(metin)}`;
}

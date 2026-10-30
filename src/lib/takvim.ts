/**
 * TAKVİME EKLEME
 *
 * Müşteriden e-posta toplamıyoruz; hatırlatma göndereceğimiz bir adres
 * yok. Bunun yerine randevuyu müşterinin kendi takvimine yazıyoruz —
 * hatırlatmayı telefonu yapıyor. Ücretsiz, izin gerektirmiyor ve
 * müşteri takvimini zaten her gün açıyor.
 */

function ikiHane(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Yerel saati takvimin anladığı biçime çevirir.
 * Türkiye UTC+3; bölge bilgisini ayrıca yazdığımız için kayma olmaz.
 */
function zamanDamgasi(gun: string, dakika: number): string {
  const [y, a, g] = gun.split("-").map(Number);
  return `${y}${ikiHane(a)}${ikiHane(g)}T${ikiHane(Math.floor(dakika / 60))}${ikiHane(dakika % 60)}00`;
}

function kacir(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (k) => "\\" + k);
}

export type TakvimKaydi = {
  baslik: string;
  gun: string;
  baslangic: number;
  dakika: number;
  yer?: string;
  not?: string;
  adres: string;
};

/** Takvim uygulamalarının okuduğu .ics metni. */
export function icsMetni(k: TakvimKaydi): string {
  const bas = zamanDamgasi(k.gun, k.baslangic);
  const bit = zamanDamgasi(k.gun, k.baslangic + k.dakika);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Salonkolay//TR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${bas}-${Math.random().toString(36).slice(2, 10)}@salonkolay`,
    `DTSTAMP:${bas}`,
    `DTSTART;TZID=Europe/Istanbul:${bas}`,
    `DTEND;TZID=Europe/Istanbul:${bit}`,
    `SUMMARY:${kacir(k.baslik)}`,
    k.yer ? `LOCATION:${kacir(k.yer)}` : "",
    k.not ? `DESCRIPTION:${kacir(k.not)}` : "",
    `URL:${k.adres}`,
    // Bir gün önce ve bir saat önce hatırlat.
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${kacir(k.baslik)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${kacir(k.baslik)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

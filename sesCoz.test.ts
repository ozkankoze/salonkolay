/** Ses çözümleyici denemeleri — `npx tsx sesCoz.test.ts` */
import { cumleCoz, eksikler } from "./src/lib/sesCoz";
import { salonlar } from "./src/lib/salon";

const salon = salonlar[0];
// 29 Ekim 2026, Perşembe
const BUGUN = new Date(2026, 9, 29);

type Bek = { ad?: string; saat?: string; gun?: string; hizmet?: string; kisi?: string };

const denemeler: [string, Bek][] = [
  ["Ayşe saat 13:00 randevu", { ad: "Ayşe", saat: "13:00" }],
  ["Ayşe saat 13.00 randevu", { ad: "Ayşe", saat: "13:00" }],
  ["Merve yarın üç buçukta kesim", { ad: "Merve", saat: "15:30", gun: "2026-10-30", hizmet: "Kadın saç kesimi" }],
  ["Zeynep cumartesi 11 de fön", { ad: "Zeynep", saat: "11:00", gun: "2026-10-31", hizmet: "Fön" }],
  ["Elif bugün 14:30 balyaj", { ad: "Elif", saat: "14:30", gun: "2026-10-29", hizmet: "Ombre / Balyaj" }],
  ["Seda saat dörtte manikür", { ad: "Seda", saat: "16:00", hizmet: "Manikür" }],
  ["Fatma on birde keratin bakım", { ad: "Fatma", saat: "11:00", hizmet: "Keratin bakım" }],
  ["Hatice yarın sabah dokuz buçukta fön", { ad: "Hatice", saat: "09:30", gun: "2026-10-30", hizmet: "Fön" }],
  ["Ayşe Yılmaz 3 Kasım 15:00 saç boyası", { ad: "Ayşe Yılmaz", saat: "15:00", gun: "2026-11-03", hizmet: "Saç boyası" }],
  ["Melis'e Zeynep 17:00 kesim", { ad: "Zeynep", saat: "17:00", hizmet: "Kadın saç kesimi", kisi: "Melis" }],
  ["Derya'ya Nalan ikide kaş", { ad: "Nalan", saat: "14:00", hizmet: "Kaş alımı", kisi: "Derya" }],
  ["Gül hanım pazartesi 10:00 fön", { ad: "Gül", saat: "10:00", gun: "2026-11-02", hizmet: "Fön" }],
  ["Esra öğleden sonra ikide kesim", { ad: "Esra", saat: "14:00", hizmet: "Kadın saç kesimi" }],
  ["Büşra saat 12:15 randevu ekle", { ad: "Büşra", saat: "12:15" }],
  ["Sevgi beşte oje", { ad: "Sevgi", saat: "17:00", hizmet: "Manikür" }],
];

let gecen = 0;
let kalan = 0;

for (const [cumle, bek] of denemeler) {
  const c = cumleCoz(cumle, salon, BUGUN);
  const hizmetAd = salon.hizmetler.filter((h) => c.hizmetIds.includes(h.id)).map((h) => h.ad).join(", ");
  const kisiAd = salon.personel.find((p) => p.id === c.personelId)?.ad;

  const sorunlar: string[] = [];
  if (bek.ad && c.ad !== bek.ad) sorunlar.push(`ad: "${c.ad}" ≠ "${bek.ad}"`);
  if (bek.saat && c.saat !== bek.saat) sorunlar.push(`saat: "${c.saat}" ≠ "${bek.saat}"`);
  if (bek.gun && c.gun !== bek.gun) sorunlar.push(`gün: "${c.gun}" ≠ "${bek.gun}"`);
  if (bek.hizmet && hizmetAd !== bek.hizmet) sorunlar.push(`hizmet: "${hizmetAd}" ≠ "${bek.hizmet}"`);
  if (bek.kisi && kisiAd !== bek.kisi) sorunlar.push(`kişi: "${kisiAd}" ≠ "${bek.kisi}"`);

  if (sorunlar.length === 0) {
    gecen++;
    console.log(`✓ ${cumle}`);
  } else {
    kalan++;
    console.log(`✗ ${cumle}`);
    sorunlar.forEach((s) => console.log(`    ${s}`));
    console.log(`    eksik: ${eksikler(c).join(", ") || "yok"}`);
  }
}

console.log(`\n${gecen}/${denemeler.length} geçti, ${kalan} kaldı`);

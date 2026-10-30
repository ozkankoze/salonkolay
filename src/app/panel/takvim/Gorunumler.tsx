import Link from "next/link";
import type { Salon } from "@/lib/salon";
import type { Randevu } from "@/lib/saat";
import { anahtarGun, calismaBul, saatYaz } from "@/lib/saat";
import { gunKaydir } from "@/lib/bicim";

/**
 * HAFTA VE AY GÖRÜNÜMLERİ
 *
 * Gün görünümü "bugün ne var" sorusunu cevaplıyor. Salon sahibinin
 * ikinci sorusu ise "önümüzdeki hafta nasıl, boş günüm var mı" —
 * onu gün şeridinde görmek zor. Bu yüzden iki toplu görünüm.
 *
 * İkisi de sunucuda çiziliyor; tıklanan gün yine gün görünümünü açıyor.
 */

const GUN_KISA = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const AY_ADI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export type GunBilgi = {
  gun: string;
  randevular: Randevu[];
  kapali: boolean;
};

/** Bir günün kapalı olup olmadığı: çalışma saatleri + tüm gün kapatmalar. */
export function gunKapaliMi(salon: Salon, gun: string, tumGunKapali: Set<string>): boolean {
  const c = calismaBul(salon, anahtarGun(gun));
  return !c || !!c.kapali || tumGunKapali.has(gun);
}

/* ───────────────────────── hafta ───────────────────────── */

export function Hafta({
  salon,
  baslangic,
  gunler,
  secili,
}: {
  salon: Salon;
  baslangic: string;
  gunler: GunBilgi[];
  secili: string;
}) {
  const onceki = gunKaydir(baslangic, -7);
  const sonraki = gunKaydir(baslangic, 7);
  const son = gunler[gunler.length - 1]?.gun ?? baslangic;

  return (
    <div>
      <Gezinme
        geri={`/panel/takvim?v=hafta&g=${onceki}`}
        ileri={`/panel/takvim?v=hafta&g=${sonraki}`}
        baslik={`${gunMetni(baslangic)} – ${gunMetni(son)}`}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {gunler.map((g) => {
          const d = anahtarGun(g.gun);
          const aktif = g.gun === secili;
          return (
            <Link
              key={g.gun}
              href={`/panel/takvim?g=${g.gun}`}
              className={`rounded-2xl border p-3 transition-colors ${
                aktif ? "border-ana" : "border-cizgi"
              } ${g.kapali ? "bg-kagit" : "bg-kart"}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-silik">{GUN_KISA[d.getDay()]}</span>
                <span className="text-[17px] font-semibold">{d.getDate()}</span>
              </div>

              {g.kapali ? (
                <p className="mt-2 text-[13px] text-silik">Kapalı</p>
              ) : g.randevular.length === 0 ? (
                <p className="mt-2 text-[13px] text-silik">Boş</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {g.randevular.slice(0, 4).map((r) => (
                    <li key={r.id} className="flex gap-1.5 text-[12.5px] leading-tight">
                      <span className="shrink-0 font-semibold tabular-nums">
                        {saatYaz(r.baslangic)}
                      </span>
                      <span className="min-w-0 truncate text-gri">{r.ad}</span>
                    </li>
                  ))}
                  {g.randevular.length > 4 && (
                    <li className="text-[12px] text-ana">
                      +{g.randevular.length - 4} randevu daha
                    </li>
                  )}
                </ul>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── ay ───────────────────────── */

export function Ay({
  ayOneki,
  gunler,
  secili,
}: {
  /** "2026-11" */
  ayOneki: string;
  gunler: GunBilgi[];
  secili: string;
}) {
  const [yil, ay] = ayOneki.split("-").map(Number);
  const ilk = new Date(yil, ay - 1, 1);
  // Hafta pazartesi başlasın: Pazar = 0 olduğu için altıya kaydırıyoruz.
  const bosluk = (ilk.getDay() + 6) % 7;

  const oncekiAy = ay === 1 ? `${yil - 1}-12` : `${yil}-${String(ay - 1).padStart(2, "0")}`;
  const sonrakiAy = ay === 12 ? `${yil + 1}-01` : `${yil}-${String(ay + 1).padStart(2, "0")}`;

  return (
    <div>
      <Gezinme
        geri={`/panel/takvim?v=ay&g=${oncekiAy}-01`}
        ileri={`/panel/takvim?v=ay&g=${sonrakiAy}-01`}
        baslik={`${AY_ADI[ay - 1]} ${yil}`}
      />

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((a) => (
          <div key={a} className="pb-1 text-center text-[11.5px] font-medium text-silik">
            {a}
          </div>
        ))}

        {Array.from({ length: bosluk }, (_, i) => (
          <div key={`bos-${i}`} />
        ))}

        {gunler.map((g) => {
          const d = anahtarGun(g.gun);
          const aktif = g.gun === secili;
          const n = g.randevular.length;
          return (
            <Link
              key={g.gun}
              href={`/panel/takvim?g=${g.gun}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-center ${
                aktif ? "border-ana bg-yumusak" : "border-cizgi"
              } ${g.kapali ? "bg-kagit" : "bg-kart"}`}
            >
              <span className={`text-[15px] font-semibold ${g.kapali ? "text-silik" : ""}`}>
                {d.getDate()}
              </span>
              {g.kapali ? (
                <span className="mt-0.5 text-[10px] text-silik">kapalı</span>
              ) : n > 0 ? (
                <span className="mt-0.5 text-[11px] font-medium text-ana">{n}</span>
              ) : (
                <span className="mt-0.5 h-[14px]" />
              )}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-[13px] text-silik">
        Rakamlar o günün randevu sayısıdır. Güne basınca o günün programı açılır.
      </p>
    </div>
  );
}

/* ───────────────────────── ortak ───────────────────────── */

function Gezinme({ geri, ileri, baslik }: { geri: string; ileri: string; baslik: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Link
        href={geri}
        aria-label="Önceki"
        className="grid h-9 w-9 place-items-center rounded-full border border-cizgi"
      >
        ‹
      </Link>
      <span className="text-[16px] font-semibold">{baslik}</span>
      <Link
        href={ileri}
        aria-label="Sonraki"
        className="grid h-9 w-9 place-items-center rounded-full border border-cizgi"
      >
        ›
      </Link>
    </div>
  );
}

function gunMetni(gun: string): string {
  const d = anahtarGun(gun);
  return `${d.getDate()} ${AY_ADI[d.getMonth()].slice(0, 3)}`;
}

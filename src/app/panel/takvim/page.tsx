import Link from "next/link";
import { araliktakiRandevular, salonunKapaliklari } from "@/lib/depo";
import { sureYaz } from "@/lib/salon";
import { calismaBul, anahtarGun, saatYaz } from "@/lib/saat";
import { bugunAnahtar, gunKaydir, gunYaz } from "@/lib/bicim";
import Kabuk, { korunanSalon } from "../Kabuk";
import { kapaliEkleEylem, kapaliSilEylem } from "../eylemler";
import ElleRandevu from "./ElleRandevu";

export const dynamic = "force-dynamic";

export default async function Takvim({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const salon = await korunanSalon();
  const sp = await searchParams;
  const bugun = bugunAnahtar();
  const gun = /^\d{4}-\d{2}-\d{2}$/.test(sp.g ?? "") ? sp.g! : bugun;

  const gunler = Array.from({ length: salon.ufukGun }, (_, i) => gunKaydir(bugun, i));
  const son = gunler[gunler.length - 1];

  const [randevular, kapaliklar] = await Promise.all([
    araliktakiRandevular(salon.slug, bugun, son),
    salonunKapaliklari(salon.slug),
  ]);

  const sayac = new Map<string, number>();
  for (const r of randevular) {
    if (r.durum === "iptal") continue;
    sayac.set(r.gun, (sayac.get(r.gun) ?? 0) + 1);
  }

  const gununRandevulari = randevular
    .filter((r) => r.gun === gun && r.durum !== "iptal")
    .sort((a, b) => a.baslangic - b.baslangic);
  const gununKapaliklari = kapaliklar.filter((k) => k.gun === gun);
  const calisma = calismaBul(salon, anahtarGun(gun));
  const haftaKapali = !calisma || calisma.kapali;

  return (
    <Kabuk salon={salon} aktif="/panel/takvim" baslik="Takvim">
      {/* gün şeridi */}
      <div className="serit -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1">
        {gunler.map((g) => {
          const d = anahtarGun(g);
          const c = calismaBul(salon, d);
          const tatil = !c || c.kapali || kapaliklar.some((k) => k.gun === g && k.baslangic === null);
          const n = sayac.get(g) ?? 0;
          const secili = g === gun;
          return (
            <Link
              key={g}
              href={`/panel/takvim?g=${g}`}
              className={`flex w-[62px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 ${
                secili ? "border-ana bg-ana text-white" : "border-cizgi bg-kart"
              }`}
            >
              <span className={`text-[11.5px] ${secili ? "opacity-80" : "text-silik"}`}>
                {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d.getDay()]}
              </span>
              <span className="mt-0.5 text-[19px] leading-none font-semibold">{d.getDate()}</span>
              <span
                className={`mt-1.5 h-[18px] text-[11px] ${
                  secili ? "opacity-85" : tatil ? "text-silik" : "text-gri"
                }`}
              >
                {tatil ? "kapalı" : n > 0 ? `${n} rnd` : ""}
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.02em]">{gunYaz(gun)}</h2>

      {haftaKapali && (
        <p className="mb-4 rounded-2xl bg-kagit px-4 py-3 text-[14.5px] text-gri">
          Salon bu gün zaten kapalı (çalışma saatlerine göre).
        </p>
      )}

      {/* günün programı */}
      {gununRandevulari.length === 0 && gununKapaliklari.length === 0 ? (
        <p className="mb-5 rounded-2xl border border-dashed border-cizgi px-5 py-8 text-center text-[15px] text-gri">
          Bu gün boş.
        </p>
      ) : (
        <ul className="mb-5 space-y-2">
          {gununKapaliklari.map((k) => (
            <li
              key={k.id}
              className="flex items-center gap-3 rounded-2xl border border-cizgi bg-kagit px-4 py-3"
            >
              <span className="w-[86px] shrink-0 text-[14px] font-medium tabular-nums text-gri">
                {k.baslangic === null ? "Tüm gün" : `${saatYaz(k.baslangic)}–${saatYaz(k.bitis!)}`}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14.5px] text-gri">
                Kapalı{k.sebep ? ` · ${k.sebep}` : ""}
              </span>
              <form action={kapaliSilEylem}>
                <input type="hidden" name="id" value={k.id} />
                <button className="shrink-0 text-[13.5px] font-medium text-ana">Aç</button>
              </form>
            </li>
          ))}

          {gununRandevulari.map((r) => {
            const kisi = salon.personel.find((p) => p.id === r.personelId);
            const hizmetler = salon.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-cizgi bg-kart px-4 py-3"
              >
                <span className="w-[86px] shrink-0 text-[14px] font-semibold tabular-nums">
                  {saatYaz(r.baslangic)}
                  <span className="ml-1 text-[11.5px] font-normal text-silik">
                    {sureYaz(r.dakika)}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{r.ad}</span>
                  <span className="block truncate text-[13px] text-silik">
                    {hizmetler.map((h) => h.ad).join(", ")}
                    {kisi ? ` — ${kisi.ad}` : ""}
                  </span>
                </span>
                <Link
                  href={`/panel/bugun?g=${gun}`}
                  className="shrink-0 text-[13.5px] font-medium text-ana"
                >
                  Aç
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-3">
        <ElleRandevu gun={gun} salon={salon} />

        {/* saat kapatma */}
        <details className="rounded-3xl border border-cizgi bg-kart p-5">
          <summary className="cursor-pointer list-none text-[15px] font-medium text-ana">
            Saat veya gün kapat
          </summary>
          <form action={kapaliEkleEylem} className="mt-4 space-y-3">
            <input type="hidden" name="gun" value={gun} />

            <label className="flex items-center gap-2.5 text-[15px]">
              <input
                type="checkbox"
                name="tumGun"
                value="evet"
                className="h-[18px] w-[18px] accent-[#b84a6e]"
              />
              Tüm günü kapat
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-gri">Başlangıç</span>
                <input
                  name="bas"
                  type="time"
                  step={300}
                  defaultValue={calisma?.acilis ?? "09:00"}
                  className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none focus:border-ana"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-gri">Bitiş</span>
                <input
                  name="bit"
                  type="time"
                  step={300}
                  defaultValue="13:00"
                  className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none focus:border-ana"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-gri">Sebep (isteğe bağlı)</span>
              <input
                name="sebep"
                placeholder="Öğle arası, doktor, tatil…"
                className="w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana"
              />
            </label>

            <button className="w-full rounded-xl border border-cizgi py-3.5 text-[15px] font-medium">
              Kapat
            </button>
            <p className="text-[13px] text-silik">
              Kapattığınız saatlerde müşteriler randevu sayfasından randevu alamaz.
            </p>
          </form>
        </details>
      </div>
    </Kabuk>
  );
}

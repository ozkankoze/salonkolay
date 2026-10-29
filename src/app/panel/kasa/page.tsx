import Link from "next/link";
import { kasaKayitlari } from "@/lib/depo";
import { bugunAnahtar, gunYaz, paraYaz } from "@/lib/bicim";
import Kabuk, { korunanSalon } from "../Kabuk";
import { kasaSilEylem } from "../eylemler";
import KasaFormu from "./KasaFormu";

export const dynamic = "force-dynamic";

const AY_ADI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function ayKaydir(ay: string, n: number): string {
  const [y, a] = ay.split("-").map(Number);
  const d = new Date(y, a - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ayYaz(ay: string): string {
  const [y, a] = ay.split("-").map(Number);
  return `${AY_ADI[a - 1]} ${y}`;
}

export default async function Kasa({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const salon = await korunanSalon();
  const sp = await searchParams;
  const buAy = bugunAnahtar().slice(0, 7);
  const ay = /^\d{4}-\d{2}$/.test(sp.a ?? "") ? sp.a! : buAy;

  const kayitlar = await kasaKayitlari(salon.slug, ay);
  const gelir = kayitlar.filter((k) => k.tur === "gelir").reduce((t, k) => t + k.tutar, 0);
  const gider = kayitlar.filter((k) => k.tur === "gider").reduce((t, k) => t + k.tutar, 0);

  const bugun = bugunAnahtar();
  const bugunNet = kayitlar
    .filter((k) => k.gun === bugun)
    .reduce((t, k) => t + (k.tur === "gelir" ? k.tutar : -k.tutar), 0);

  // güne göre grupla
  const gruplar = new Map<string, typeof kayitlar>();
  for (const k of kayitlar) {
    if (!gruplar.has(k.gun)) gruplar.set(k.gun, []);
    gruplar.get(k.gun)!.push(k);
  }

  return (
    <Kabuk salon={salon} aktif="/panel/kasa" baslik="Kasa defteri">
      {/* ay gezinmesi */}
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/panel/kasa?a=${ayKaydir(ay, -1)}`}
          aria-label="Önceki ay"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cizgi text-gri"
        >
          ‹
        </Link>
        <div className="flex-1 rounded-full border border-cizgi bg-kart px-4 py-2.5 text-center text-[15px] font-medium">
          {ayYaz(ay)}
        </div>
        <Link
          href={`/panel/kasa?a=${ayKaydir(ay, 1)}`}
          aria-label="Sonraki ay"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cizgi text-gri"
        >
          ›
        </Link>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <Kutu baslik="Gelir" deger={paraYaz(gelir)} renk="text-[#146b48]" />
        <Kutu baslik="Gider" deger={paraYaz(gider)} renk="text-ana" />
        <Kutu baslik="Kalan" deger={paraYaz(gelir - gider)} />
      </div>

      {ay === buAy && (
        <p className="mb-6 rounded-2xl bg-kagit px-4 py-3 text-[14.5px] text-gri">
          Bugün kasada <b className="text-murekkep">{paraYaz(bugunNet)}</b> var.
        </p>
      )}

      <div className="mb-6">
        <KasaFormu gun={bugun} />
      </div>

      {kayitlar.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-cizgi px-5 py-10 text-center text-[15px] text-gri">
          Bu ay hiç kayıt yok. Bugün ekranında bir randevuyu “Geldi” yaptığınızda tutarı
          otomatik buraya düşer.
        </p>
      ) : (
        <div className="space-y-5">
          {[...gruplar.entries()].map(([g, liste]) => {
            const net = liste.reduce((t, k) => t + (k.tur === "gelir" ? k.tutar : -k.tutar), 0);
            return (
              <section key={g}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-[14px] font-semibold tracking-[0.02em]">{gunYaz(g)}</h3>
                  <span className="text-[13.5px] font-medium text-gri">{paraYaz(net)}</span>
                </div>
                <ul className="divide-y divide-cizgi overflow-hidden rounded-2xl border border-cizgi bg-kart">
                  {liste.map((k) => (
                    <li key={k.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          k.tur === "gelir" ? "bg-[#1f9d68]" : "bg-ana"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate text-[14.5px]">
                        {k.aciklama ?? (k.tur === "gelir" ? "Gelir" : "Gider")}
                      </span>
                      <span
                        className={`shrink-0 text-[14.5px] font-medium tabular-nums ${
                          k.tur === "gelir" ? "text-[#146b48]" : "text-ana"
                        }`}
                      >
                        {k.tur === "gelir" ? "+" : "−"}
                        {paraYaz(k.tutar)}
                      </span>
                      <form action={kasaSilEylem} className="shrink-0">
                        <input type="hidden" name="id" value={k.id} />
                        <button
                          aria-label="Kaydı sil"
                          className="px-1 text-[16px] leading-none text-silik"
                        >
                          ×
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Kabuk>
  );
}

function Kutu({ baslik, deger, renk }: { baslik: string; deger: string; renk?: string }) {
  return (
    <div className="rounded-2xl border border-cizgi bg-kart px-4 py-3.5">
      <div className="text-[12.5px] text-silik">{baslik}</div>
      <div className={`mt-1 text-[17px] font-semibold tabular-nums ${renk ?? ""}`}>{deger}</div>
    </div>
  );
}

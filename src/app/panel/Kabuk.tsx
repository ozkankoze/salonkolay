import Link from "next/link";
import { redirect } from "next/navigation";
import { oturumSalonu } from "@/lib/oturum";
import type { Salon } from "@/lib/salon";
import { cikisEylem } from "./eylemler";

/** Oturum yoksa girişe atar; varsa salonu verir. */
export async function korunanSalon(): Promise<Salon> {
  const salon = await oturumSalonu();
  if (!salon) redirect("/panel");
  return salon;
}

const SEKMELER = [
  { yol: "/panel/bugun", ad: "Bugün", ikon: "takvim-gun" },
  { yol: "/panel/takvim", ad: "Takvim", ikon: "takvim" },
  { yol: "/panel/kasa", ad: "Kasa", ikon: "kasa" },
  { yol: "/panel/ayarlar", ad: "Ayarlar", ikon: "ayar" },
] as const;

function Ikon({ ad }: { ad: string }) {
  const ortak = {
    className: "h-[22px] w-[22px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (ad === "takvim-gun")
    return (
      <svg {...ortak}>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <circle cx="12" cy="15.5" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    );
  if (ad === "takvim")
    return (
      <svg {...ortak}>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 18h2M14 18h2" />
      </svg>
    );
  if (ad === "kasa")
    return (
      <svg {...ortak}>
        <rect x="2.5" y="6" width="19" height="13" rx="3" />
        <path d="M2.5 10.5h19" />
        <circle cx="17" cy="15" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  return (
    <svg {...ortak}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5" />
    </svg>
  );
}

export default async function Kabuk({
  salon,
  aktif,
  baslik,
  children,
  sagUst,
}: {
  salon: Salon;
  aktif: string;
  baslik: string;
  children: React.ReactNode;
  sagUst?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      {/* üst çubuk */}
      <header className="sticky top-0 z-30 border-b border-cizgi bg-kagit/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[980px] items-center gap-3 px-5">
          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold tracking-[-0.01em]">{baslik}</div>
            <div className="truncate text-[12.5px] text-silik">{salon.ad}</div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {sagUst}
            <Link
              href={`/${salon.slug}`}
              target="_blank"
              className="hidden rounded-full border border-cizgi px-3.5 py-2 text-[13px] font-medium text-gri sm:block"
            >
              Siteyi gör
            </Link>
            <form action={cikisEylem}>
              <button className="rounded-full border border-cizgi px-3.5 py-2 text-[13px] font-medium text-gri">
                Çıkış
              </button>
            </form>
          </div>
        </div>

        {/* masaüstü sekmeleri */}
        <nav className="mx-auto hidden max-w-[980px] gap-1 px-4 md:flex">
          {SEKMELER.map((s) => (
            <Link
              key={s.yol}
              href={s.yol}
              className={`-mb-px border-b-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                aktif === s.yol
                  ? "border-ana text-ana"
                  : "border-transparent text-gri hover:text-murekkep"
              }`}
            >
              {s.ad}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[980px] px-5 pt-6 pb-28 md:pb-12">{children}</main>

      {/* mobil alt çubuk */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cizgi bg-kagit/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-[560px]">
          {SEKMELER.map((s) => (
            <Link
              key={s.yol}
              href={s.yol}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-medium ${
                aktif === s.yol ? "text-ana" : "text-silik"
              }`}
            >
              <Ikon ad={s.ikon} />
              {s.ad}
            </Link>
          ))}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}

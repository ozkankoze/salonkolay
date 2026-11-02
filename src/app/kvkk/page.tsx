import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DIL_CEREZI, dilSec, dilliAdres, sozluk } from "@/lib/dil";
import { platformMetni } from "@/lib/kvkkPlatform";
import UstBar from "../_bolum/UstBar";
import AltBilgi from "../_bolum/AltBilgi";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}): Promise<Metadata> {
  const { dil: adresDili } = await searchParams;
  const t = sozluk(dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value));
  return { title: t.pKvkkBaslik, description: t.pKvkkAlt };
}

/** **kalın** işaretlerini kalın metne çevirir. */
function kalinla(metin: string, anahtar: string) {
  return metin.split(/(\*\*[^*]+\*\*)/g).map((parca, i) =>
    parca.startsWith("**") && parca.endsWith("**") ? (
      <b key={`${anahtar}-${i}`} className="font-semibold text-p-murekkep">
        {parca.slice(2, -2)}
      </b>
    ) : (
      <span key={`${anahtar}-${i}`}>{parca}</span>
    ),
  );
}

export default async function PlatformKvkk({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}) {
  const { dil: adresDili } = await searchParams;
  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value);
  const t = sozluk(dil);
  const bolumler = platformMetni(dil);

  return (
    <div lang={dil} className="flex min-h-screen flex-col bg-p-zemin text-p-murekkep">
      <UstBar dil={dil} t={t} />

      <main className="flex-1 pt-[68px]">
        <div className="mx-auto w-full max-w-[760px] px-5 py-14 sm:px-7 sm:py-20">
          <h1 className="p-baslik text-[clamp(28px,4.6vw,42px)] leading-[1.08]">
            {t.pKvkkBaslik}
          </h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-p-gri">{t.pKvkkAlt}</p>

          <div className="mt-12 space-y-10">
            {bolumler.map((b) => (
              <section key={b.baslik}>
                <h2 className="p-baslik text-[20px] leading-snug">{b.baslik}</h2>
                <div className="mt-3 space-y-3">
                  {b.paragraflar.map((p, i) => (
                    <p key={i} className="text-[16px] leading-relaxed text-p-gri">
                      {kalinla(p, `${b.baslik}-${i}`)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-14 border-t border-p-cizgi pt-6 text-[14px] text-p-silik">
            {t.pKvkkSalon}{" "}
            <Link href={dilliAdres("/kesfet", dil)} className="p-odak text-p-vurgu underline">
              {t.pKesfet}
            </Link>
          </p>
        </div>
      </main>

      <AltBilgi dil={dil} t={t} />
    </div>
  );
}

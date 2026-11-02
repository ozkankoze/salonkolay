import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DIL_CEREZI, dilSec, sozluk } from "@/lib/dil";
import UstBar from "../_bolum/UstBar";
import AltBilgi from "../_bolum/AltBilgi";
import Form from "./Form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}): Promise<Metadata> {
  const { dil: adresDili } = await searchParams;
  const t = sozluk(dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value));
  return { title: t.pSalonEkle, description: t.sAciklama };
}

export default async function SalonEkle({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}) {
  const { dil: adresDili } = await searchParams;
  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value);
  const t = sozluk(dil);

  return (
    <div lang={dil} className="flex min-h-screen flex-col bg-p-zemin text-p-murekkep">
      <UstBar dil={dil} t={t} />

      <main className="flex-1 pt-[68px]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-14 sm:px-7 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <h1 className="p-serif text-[clamp(30px,5vw,46px)] leading-[1.07] tracking-[-0.018em]">
              {t.sBaslik}
            </h1>
            <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-p-gri">
              {t.sAciklama}
            </p>

            <ul className="mt-9 space-y-0 border-t border-p-cizgi">
              {[
                [t.pSahip1, t.pSahip1Alt],
                [t.pSahip2, t.pSahip2Alt],
                [t.pSahip3, t.pSahip3Alt],
              ].map(([bas, alt]) => (
                <li key={bas} className="border-b border-p-cizgi py-5">
                  <h2 className="text-[16.5px] font-medium text-p-murekkep">{bas}</h2>
                  <p className="mt-1.5 max-w-[400px] text-[15px] leading-relaxed text-p-gri">{alt}</p>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-[15px] text-p-gri">
              <a href="tel:+905370108611" className="p-odak font-medium text-p-vurgu">
                0537 010 86 11
              </a>
              {" · "}
              <a href="mailto:info@medya333.com" className="p-odak font-medium text-p-vurgu">
                info@medya333.com
              </a>
            </p>
          </div>

          <Form dil={dil} t={t} />
        </div>
      </main>

      <AltBilgi dil={dil} t={t} />
    </div>
  );
}

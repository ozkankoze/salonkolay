import type { Metadata } from "next";
import { cookies } from "next/headers";
import { tumSalonlar } from "@/lib/salon";
import { DIL_CEREZI, dilSec, dilliAdres, sozluk } from "@/lib/dil";
import DilDugmesi from "./DilDugmesi";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}): Promise<Metadata> {
  const { dil: adresDili } = await searchParams;
  const t = sozluk(dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value));
  // Kök düzenin başlık şablonu "%s · Salonkolay" — burada mutlak başlık veriyoruz.
  return { title: { absolute: t.skTitle }, description: t.skDescription };
}

export default async function Anasayfa({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}) {
  const { dil: adresDili } = await searchParams;
  // Salonkolay'ın kendi sayfası her zaman iki dilli — eklenti ayarına bakmaz.
  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value);
  const t = sozluk(dil);
  const s = tumSalonlar();

  return (
    <main
      lang={dil}
      className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ana text-[22px] font-bold text-white">
          S
        </div>
        <DilDugmesi dil={dil} />
      </div>

      <h1 className="mt-6 text-[38px] leading-[1.05] font-semibold tracking-[-0.035em]">
        {t.skBaslikUst}
        <br />
        {t.skBaslikAlt}
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-gri">{t.skAciklama}</p>

      <p className="mt-8 text-[12px] font-semibold tracking-[.16em] text-silik uppercase">
        {t.skOrnekler}
      </p>
      <div className="mt-3 space-y-2">
        {s.map((x) => (
          <a
            key={x.slug}
            href={dilliAdres(`/${x.slug}`, dil)}
            className="flex items-center justify-between rounded-2xl border border-cizgi bg-kart px-5 py-4"
          >
            <span>
              <span className="block text-[16px] font-medium">{x.ad}</span>
              <span className="block text-[13.5px] text-silik">salonkolay.com/{x.slug}</span>
            </span>
            <span className="text-ana">→</span>
          </a>
        ))}
      </div>

      <a href="/panel" className="mt-6 text-[14.5px] font-medium text-ana">
        {t.skPanel} →
      </a>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { salonGetir } from "@/lib/salonVeri";
import { DIL_CEREZI, dilSec, dilliAdres, sozluk } from "@/lib/dil";
import DilDugmesi from "../../DilDugmesi";
import Randevu from "../Randevu";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dil?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { dil: adresDili } = await searchParams;
  const s = await salonGetir(slug);
  if (!s) return {};

  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value, s.ingilizce);
  const t = sozluk(dil);

  return {
    title: `${t.basRandevuAl} — ${s.ad}`,
    description: `${s.ad} ${t.basRandevuAciklama}`,
    alternates: { canonical: `/${s.slug}/randevu` },
  };
}

export default async function RandevuSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dil?: string; h?: string }>;
}) {
  const { slug } = await params;
  const { dil: adresDili, h } = await searchParams;
  const s = await salonGetir(slug);
  if (!s) notFound();

  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value, s.ingilizce);
  const t = sozluk(dil);
  const yol = (a: string) => dilliAdres(a, dil);

  // Adresten gelen hizmet kimlikleri doğrulanmadan kullanılmaz:
  // salonda olmayan bir kimlik akışı bozardı.
  const onSecili = (h ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => s.hizmetler.some((hz) => hz.id === x));

  return (
    <div lang={dil} className="min-h-dvh" style={{ background: s.zemin }}>
      {/* üst şerit */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "rgba(0,0,0,.07)", background: "rgba(255,255,255,.88)" }}
      >
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
          <Link
            href={yol(`/${s.slug}`)}
            aria-label={t.salonaDon}
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: s.koyu }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link href={yol(`/${s.slug}`)} className="flex min-w-0 items-center gap-2.5">
            {s.logo ? (
              <Image
                src={s.logo}
                alt={s.ad}
                width={38}
                height={38}
                className="h-9 w-9 rounded-full object-contain"
              />
            ) : null}
            <span className="truncate text-[15px] font-semibold" style={{ color: s.koyu }}>
              {s.ad}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {s.ingilizce && <DilDugmesi dil={dil} renk={s.renk} koyu={s.koyu} />}
            <a
              href={`tel:+${s.telefon}`}
              className="rounded-full border px-3.5 py-2 text-[13px] font-medium transition hover:bg-black/[.03]"
              style={{ borderColor: "rgba(0,0,0,.12)", color: s.koyu }}
            >
              {t.ara}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-9">
        <p
          className="text-[12px] font-semibold uppercase tracking-[.18em]"
          style={{ color: s.renk }}
        >
          {t.onlineRandevu}
        </p>
        <h1
          className="mt-2 text-[28px] font-bold leading-tight sm:text-[34px]"
          style={{ color: s.koyu }}
        >
          {t.uygunSaatiSecin}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gri">
          {t.randevuGiris}
        </p>

        <div className="mt-8">
          <Randevu salon={s} dil={dil} t={t} onSecili={onSecili} />
        </div>

        {s.demo ? (
          <p
            className="mt-12 rounded-2xl border p-5 text-[13px] leading-relaxed text-gri"
            style={{ borderColor: "rgba(0,0,0,.08)", background: "rgba(255,255,255,.7)" }}
          >
            <b style={{ color: s.koyu }}>{t.demoBaslik}</b> {t.demoAciklama} {t.demoRandevu}
          </p>
        ) : null}
      </main>
    </div>
  );
}

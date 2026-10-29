import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { salonGetir } from "@/lib/salonVeri";
import Randevu from "../Randevu";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await salonGetir(slug);
  if (!s) return {};
  return {
    title: `Randevu al — ${s.ad}`,
    description: `${s.ad} için uygun saati seçin, randevunuzu saniyeler içinde oluşturun.`,
    alternates: { canonical: `/${s.slug}/randevu` },
  };
}

export default async function RandevuSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await salonGetir(slug);
  if (!s) notFound();

  return (
    <div className="min-h-dvh" style={{ background: s.zemin }}>
      {/* üst şerit */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "rgba(0,0,0,.07)", background: "rgba(255,255,255,.88)" }}
      >
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
          <Link
            href={`/${s.slug}`}
            aria-label="Salon sayfasına dön"
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: s.koyu }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link href={`/${s.slug}`} className="flex min-w-0 items-center gap-2.5">
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

          <a
            href={`tel:+${s.telefon}`}
            className="ml-auto shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium transition hover:bg-black/[.03]"
            style={{ borderColor: "rgba(0,0,0,.12)", color: s.koyu }}
          >
            Ara
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-9">
        <p
          className="text-[12px] font-semibold uppercase tracking-[.18em]"
          style={{ color: s.renk }}
        >
          Online randevu
        </p>
        <h1
          className="mt-2 text-[28px] font-bold leading-tight sm:text-[34px]"
          style={{ color: s.koyu }}
        >
          Size uygun saati seçin
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gri">
          Hizmetinizi ve saatinizi seçin, adınızı yazın — randevunuz anında oluşur. Telefonla
          uğraşmanıza gerek yok.
        </p>

        <div className="mt-8">
          <Randevu salon={s} />
        </div>

        {s.demo ? (
          <p
            className="mt-12 rounded-2xl border p-5 text-[13px] leading-relaxed text-gri"
            style={{ borderColor: "rgba(0,0,0,.08)", background: "rgba(255,255,255,.7)" }}
          >
            <b style={{ color: s.koyu }}>Bu bir demo sayfadır.</b> Salon adı, adres, telefon,
            fiyatlar ve ekip üyeleri örnek amaçlı hazırlanmıştır; gerçek bir işletmeye veya gerçek
            kişilere ait değildir. Buradan oluşturulan randevular hiçbir yere iletilmez.
          </p>
        ) : null}
      </main>
    </div>
  );
}

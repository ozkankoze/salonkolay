import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hizmetGruplari } from "@/lib/salon";
import { cookies } from "next/headers";
import {
  DIL_CEREZI,
  dilSec,
  dilliAdres,
  fiyatYazDil,
  sec,
  sozluk,
  sureYazDil,
} from "@/lib/dil";
import DilDugmesi from "../DilDugmesi";
import { salonGetir } from "@/lib/salonVeri";

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
  const slogan = sec(s.slogan, s.sloganEn, dil);
  const hakkinda = sec(s.hakkinda, s.hakkindaEn, dil);

  return {
    title: `${s.ad} — ${slogan ?? t.basRandevu}`,
    description: hakkinda?.slice(0, 155),
    openGraph: { title: s.ad, description: slogan, images: s.kapak ? [s.kapak] : undefined },
  };
}

export default async function SalonSitesi({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dil?: string }>;
}) {
  const { slug } = await params;
  const { dil: adresDili } = await searchParams;
  const s = await salonGetir(slug);
  if (!s) notFound();

  const dil = dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value, s.ingilizce);
  const t = sozluk(dil);
  const yol = (a: string) => dilliAdres(a, dil);

  const bugun = new Date().getDay();
  const gruplar = hizmetGruplari(s, dil === "en");
  const stil = {
    "--renk": s.renk,
    "--koyu": s.koyu,
    "--zemin": s.zemin,
    "--acik": s.acikZemin,
  } as React.CSSProperties;

  return (
    <div lang={dil} style={{ ...stil, background: "var(--zemin)", color: "var(--koyu)" }}>
      {/* ═══════ üst çubuk ═══════ */}
      <header className="sticky top-0 z-40 border-b border-black/[.07] backdrop-blur-md" style={{ background: `${s.zemin}e6` }}>
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5">
          <Link href={`/${s.slug}`} className="flex items-center gap-2.5">
            {s.logo && (
              <Image src={s.logo} alt={s.ad} width={40} height={40} className="h-10 w-10 object-contain" />
            )}
            <span className="text-[18px] font-semibold tracking-[-0.01em]">{s.ad}</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[15px] md:flex">
            <a href="#hizmetler" className="opacity-70 transition-opacity hover:opacity-100">{t.menuHizmetler}</a>
            <a href="#ekip" className="opacity-70 transition-opacity hover:opacity-100">{t.menuEkip}</a>
            <a href="#galeri" className="opacity-70 transition-opacity hover:opacity-100">{t.menuGaleri}</a>
            <a href="#iletisim" className="opacity-70 transition-opacity hover:opacity-100">{t.menuIletisim}</a>
          </nav>
          <div className="flex items-center gap-2">
            {s.ingilizce && <DilDugmesi dil={dil} renk={s.renk} koyu={s.koyu} />}
            <Link
              href={yol(`/${s.slug}/randevu`)}
              className="rounded-full px-5 py-2.5 text-[15px] font-semibold text-white"
              style={{ background: "var(--koyu)" }}
            >
              {t.randevuAl}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════ hero ═══════ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            {s.logo && (
              <Image
                src={s.logo}
                alt={s.ad}
                width={200}
                height={200}
                priority
                className="mb-6 h-32 w-32 object-contain md:h-40 md:w-40"
              />
            )}
            <h1 className="text-[42px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[56px]">
              {t.heroUst}
              <br />
              <span style={{ color: "var(--renk)" }}>{t.heroAlt}</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.65] opacity-75">
              {t.heroAciklama} {sec(s.slogan, s.sloganEn, dil)}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={yol(`/${s.slug}/randevu`)}
                className="rounded-full px-7 py-4 text-[16px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,0,0,.6)]"
                style={{ background: "var(--koyu)" }}
              >
                {t.randevuAl}
              </Link>
              <a
                href={`https://wa.me/${s.telefon}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-6 py-4 text-[16px] font-medium"
                style={{ borderColor: "rgba(0,0,0,.14)" }}
              >
                {t.whatsapp}
              </a>
            </div>

            {s.rakamlar && (
              <div className="mt-10 flex gap-8">
                {s.rakamlar.map((r) => (
                  <div key={r.etiket}>
                    <div className="text-[26px] font-semibold" style={{ color: "var(--renk)" }}>
                      {r.sayi}
                    </div>
                    <div className="text-[13.5px] opacity-60">{sec(r.etiket, r.etiketEn, dil)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {s.kapak && (
            <div className="relative">
              <div className="overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,.5)]">
                <Image
                  src={s.kapak}
                  alt={`${s.ad} salon`}
                  width={1200}
                  height={800}
                  priority
                  className="h-[320px] w-full object-cover md:h-[460px]"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ hakkında ═══════ */}
      {s.hakkinda && (
        <section className="mx-auto max-w-[1120px] px-5 py-14">
          <div
            className="grid gap-8 rounded-[28px] p-8 md:grid-cols-[1.1fr_1fr] md:p-12"
            style={{ background: "var(--acik)" }}
          >
            <div>
              <div className="text-[13px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--renk)" }}>
                {t.hakkimizda}
              </div>
              <h2 className="mt-3 text-[30px] leading-[1.12] font-semibold tracking-[-0.025em] md:text-[36px]">
                {sec(s.hakkindaBaslik, s.hakkindaBaslikEn, dil)}
              </h2>
              <p className="mt-4 text-[16.5px] leading-[1.7] opacity-75">{sec(s.hakkinda, s.hakkindaEn, dil)}</p>
            </div>
            {s.galeri?.[0] && (
              <Image
                src={s.galeri[0]}
                alt=""
                width={1200}
                height={800}
                className="h-full min-h-[220px] w-full rounded-2xl object-cover"
              />
            )}
          </div>
        </section>
      )}

      {/* ═══════ hizmetler ═══════ */}
      <section id="hizmetler" className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="text-[13px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--renk)" }}>
          {t.fiyatListesi}
        </div>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.025em] md:text-[38px]">{t.hizmetler}</h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {gruplar.map((g) => (
            <div key={g.grup} className="rounded-[22px] p-6" style={{ background: "var(--acik)" }}>
              <h3 className="text-[13px] font-semibold tracking-[0.16em] uppercase opacity-45">{g.baslik}</h3>
              <ul className="mt-3">
                {g.hizmetler.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-baseline gap-4 border-b border-black/[.07] py-3.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[16.5px] font-medium">{sec(h.ad, h.adEn, dil)}</div>
                      <div className="mt-0.5 text-[13.5px] opacity-55">
                        {sureYazDil(h.dakika, dil)}
                        {h.aciklama ? ` · ${sec(h.aciklama, h.aciklamaEn, dil)}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-[16px] font-semibold">
                      {fiyatYazDil(h.fiyat, dil) ?? (
                        <span className="text-[13.5px] font-normal opacity-55">
                          {t.salondaBelirlenir}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={yol(`/${s.slug}/randevu`)}
            className="inline-block rounded-full px-8 py-4 text-[16px] font-semibold text-white"
            style={{ background: "var(--koyu)" }}
          >
            {t.saatSecRandevuAl}
          </Link>
        </div>
      </section>

      {/* ═══════ ekip ═══════ */}
      <section id="ekip" className="mx-auto max-w-[1120px] px-5 py-14">
        <div className="text-[13px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--renk)" }}>
          {t.tanisalim}
        </div>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.025em] md:text-[38px]">{t.ekibimiz}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {s.personel.map((p) => (
            <div key={p.id} className="rounded-[22px] p-7 text-center" style={{ background: "var(--acik)" }}>
              {p.foto ? (
                <Image
                  src={p.foto}
                  alt={p.ad}
                  width={200}
                  height={200}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="relative mx-auto h-24 w-24">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1px solid ${s.renk}66` }}
                  />
                  <div
                    className="absolute inset-[7px] grid place-items-center rounded-full text-[28px] font-semibold"
                    style={{
                      background: `linear-gradient(150deg, ${s.renk}2e, ${s.renk}0d)`,
                      color: s.renk,
                    }}
                  >
                    {p.ad.charAt(0)}
                  </div>
                </div>
              )}
              <div className="mt-4 text-[19px] font-semibold">{p.ad}</div>
              {p.unvan && (
                <div className="mt-1 text-[14px] opacity-60">{sec(p.unvan, p.unvanEn, dil)}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ galeri ═══════ */}
      {s.galeri && s.galeri.length > 1 && (
        <section id="galeri" className="mx-auto max-w-[1120px] px-5 py-10">
          <div className="text-[13px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--renk)" }}>
            {t.salondan}
          </div>
          <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.025em] md:text-[38px]">{t.galeri}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {s.galeri.map((g, i) => (
              <Image
                key={g}
                src={g}
                alt=""
                width={1200}
                height={800}
                className={`w-full rounded-2xl object-cover ${i === 0 ? "h-[220px] md:h-[300px] md:col-span-2" : "h-[220px] md:h-[300px]"}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════ yorumlar ═══════ */}
      {s.yorumlar && (
        <section className="mx-auto max-w-[1120px] px-5 py-14">
          <div className="text-[13px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--renk)" }}>
            {t.misafirlerimiz}
          </div>
          <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.025em] md:text-[38px]">{t.neDiyorlar}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {s.yorumlar.map((y) => (
              <div key={y.ad} className="rounded-[22px] p-7" style={{ background: "var(--acik)" }}>
                <div className="text-[15px]" style={{ color: "var(--renk)" }}>
                  {"★".repeat(y.puan)}
                </div>
                <p className="mt-3 text-[15.5px] leading-[1.65] opacity-80">{sec(y.metin, y.metinEn, dil)}</p>
                <div className="mt-4 text-[14px] font-medium">
                  {y.ad}
                  {y.tarih && (
                    <span className="ml-2 font-normal opacity-50">{sec(y.tarih, y.tarihEn, dil)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ iletişim ═══════ */}
      <section id="iletisim" className="mx-auto max-w-[1120px] px-5 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[22px] p-8" style={{ background: "var(--acik)" }}>
            <h3 className="text-[13px] font-semibold tracking-[0.16em] uppercase opacity-45">{t.calismaSaatleri}</h3>
            <ul className="mt-4">
              {[1, 2, 3, 4, 5, 6, 0].map((g) => {
                const c = s.calisma.find((x) => x.gun === g);
                const kapali = !c || c.kapali;
                return (
                  <li
                    key={g}
                    className={`flex items-center justify-between border-b border-black/[.07] py-2.5 text-[15.5px] last:border-0 ${
                      g === bugun ? "font-semibold" : ""
                    }`}
                  >
                    <span>
                      {t.gunler[g]}
                      {g === bugun && <span className="ml-2 text-[12px] opacity-50">{t.bugun}</span>}
                    </span>
                    <span className={kapali ? "opacity-45" : ""}>
                      {kapali ? t.kapali : `${c!.acilis} – ${c!.kapanis}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-[22px] p-8" style={{ background: "var(--acik)" }}>
            <h3 className="text-[13px] font-semibold tracking-[0.16em] uppercase opacity-45">{t.iletisim}</h3>
            {s.adres && <p className="mt-4 text-[16px] leading-[1.6]">{s.adres}</p>}
            <div className="mt-5 space-y-2.5 text-[16px]">
              <a href={`tel:+${s.telefon}`} className="block font-medium">
                +{s.telefon.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")}
              </a>
              {s.instagram && (
                <a
                  href={`https://instagram.com/${s.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block opacity-70"
                >
                  @{s.instagram}
                </a>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={s.haritaUrl ?? `https://maps.google.com/?q=${encodeURIComponent(s.adres ?? s.ad)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-5 py-3 text-[15px] font-medium"
                style={{ borderColor: "rgba(0,0,0,.14)" }}
              >
                {t.yolTarifi}
              </a>
              <a
                href={`https://wa.me/${s.telefon}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-5 py-3 text-[15px] font-semibold text-white"
                style={{ background: "var(--renk)" }}
              >
                {t.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ randevu çağrısı ═══════ */}
      <section className="mx-auto max-w-[1120px] px-5 pb-16">
        <div
          className="rounded-[28px] px-8 py-14 text-center text-white"
          style={{ background: "var(--koyu)" }}
        >
          <h2 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.025em] md:text-[40px]">
            {t.saatiniziAyirin}
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[16.5px] leading-[1.6] opacity-70">
            {t.saatiniziAciklama}
          </p>
          <Link
            href={yol(`/${s.slug}/randevu`)}
            className="mt-8 inline-block rounded-full px-9 py-4 text-[16px] font-semibold"
            style={{ background: "var(--renk)", color: "#fff" }}
          >
            {t.randevuAl}
          </Link>
        </div>
      </section>

      {/* ═══════ alt ═══════ */}
      <footer className="border-t border-black/[.07]">
        <div className="mx-auto max-w-[1120px] px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-[15px] font-semibold">{s.ad}</div>
            <a
              href="https://salonkolay.com"
              target="_blank"
              rel="noreferrer"
              className="text-[14px] opacity-55"
            >
              {t.salonkolayIle}
            </a>
          </div>

          {s.demo && (
            <div
              className="mt-6 rounded-2xl border border-dashed p-5 text-[13.5px] leading-[1.65] opacity-70"
              style={{ borderColor: "rgba(0,0,0,.2)" }}
            >
              <b>{t.demoBaslik}</b> {t.demoAciklama}
            </div>
          )}
        </div>
      </footer>

      {/* ═══════ mobil sabit çubuk ═══════ */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[.07] px-4 py-3 backdrop-blur md:hidden"
        style={{ background: `${s.zemin}f2` }}
      >
        <div className="mx-auto flex max-w-[560px] gap-2">
          <Link
            href={yol(`/${s.slug}/randevu`)}
            className="flex-1 rounded-xl py-3.5 text-center text-[16px] font-semibold text-white"
            style={{ background: "var(--koyu)" }}
          >
            {t.randevuAl}
          </Link>
          <a
            href={`tel:+${s.telefon}`}
            className="rounded-xl border px-5 py-3.5 text-[15px] font-medium"
            style={{ borderColor: "rgba(0,0,0,.14)" }}
          >
            {t.ara}
          </a>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  );
}

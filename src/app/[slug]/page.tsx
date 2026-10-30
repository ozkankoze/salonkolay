import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hizmetGruplari, type Salon } from "@/lib/salon";
import { puanOrtalamasi, salonDurumu, type Durum } from "@/lib/saat";
import { anTR } from "@/lib/zaman";
import { cookies } from "next/headers";
import {
  DIL_CEREZI,
  dilSec,
  doldur,
  dilliAdres,
  fiyatYazDil,
  sec,
  sozluk,
  sureYazDil,
  type Dil,
  type Sozluk,
} from "@/lib/dil";
import DilDugmesi from "../DilDugmesi";
import HizmetSecimi from "./HizmetSecimi";
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

  const an = anTR();
  const bugun = an.haftaGunu;
  const durum = salonDurumu(s, an);
  const puan = puanOrtalamasi(s);
  const gruplar = hizmetGruplari(s, dil === "en");
  const stil = {
    "--renk": s.renk,
    "--koyu": s.koyu,
    "--zemin": s.zemin,
    "--acik": s.acikZemin,
  } as React.CSSProperties;

  return (
    <div
      lang={dil}
      className="pb-[92px] md:pb-0"
      style={{ ...stil, background: "var(--zemin)", color: "var(--koyu)" }}
    >
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
              className="hidden rounded-full px-5 py-2.5 text-[15px] font-semibold text-white md:inline-block"
              style={{ background: "var(--koyu)" }}
            >
              {t.randevuAl}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════ hero ═══════ */}
      <section className="relative">
        {/*
          Kapak artık yarım sütun değil, sayfanın tamamını kaplıyor:
          salonun kendi mekânı ilk görülen şey olsun. Metin üstüne
          geldiği için fotoğrafın üzerine koyu bir geçiş seriyoruz,
          yoksa açık fotoğraflarda yazı okunmuyor.
        */}
        {s.kapak ? (
          <div className="relative min-h-[560px] md:min-h-[620px]">
            <Image
              src={s.kapak}
              alt={`${s.ad} — ${sec(s.slogan, s.sloganEn, dil) ?? ""}`}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.52) 0%, rgba(0,0,0,.30) 38%, rgba(0,0,0,.72) 100%)",
              }}
            />
            <div className="relative mx-auto flex min-h-[560px] max-w-[1120px] flex-col justify-end px-5 pt-16 pb-12 text-white md:min-h-[620px] md:pb-16">
              <HeroIcerik
                s={s}
                t={t}
                dil={dil}
                durum={durum}
                puan={puan}
                yol={yol}
                beyaz
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1120px] px-5 py-16">
            <HeroIcerik s={s} t={t} dil={dil} durum={durum} puan={puan} yol={yol} />
          </div>
        )}
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

        <HizmetSecimi
          gruplar={gruplar}
          slug={s.slug}
          telefon={s.telefon}
          dil={dil}
          t={t}
          renk={s.renk}
          koyu={s.koyu}
          acikZemin={s.acikZemin}
        />
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
      
    </div>
  );
}

/* ═══════════════ kahraman bölümünün içeriği ═══════════════ */

/**
 * Kapak fotoğrafı varsa onun üstünde beyaz, yoksa normal zeminde
 * koyu renkle çizilir. İki hâl için iki ayrı blok yazmak yerine
 * renkleri `beyaz` bayrağı belirliyor.
 */
function HeroIcerik({
  s,
  t,
  dil,
  durum,
  puan,
  yol,
  beyaz = false,
}: {
  s: Salon;
  t: Sozluk;
  dil: Dil;
  durum: Durum;
  puan: { puan: number; adet: number } | null;
  yol: (a: string) => string;
  beyaz?: boolean;
}) {
  const solgun = beyaz ? "opacity-85" : "opacity-70";

  return (
    <>
      <div className="flex items-center gap-4">
        {s.logo && (
          <span
            className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-2xl p-2 md:h-[84px] md:w-[84px]"
            style={{ background: beyaz ? "rgba(255,255,255,.92)" : "var(--acik)" }}
          >
            <Image
              src={s.logo}
              alt={s.ad}
              width={160}
              height={160}
              priority
              className="h-full w-full object-contain"
            />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[46px]">
            {s.ad}
          </h1>
          {s.adres && (
            <p className={`mt-1.5 flex items-center gap-1.5 text-[14.5px] md:text-[16px] ${solgun}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="truncate">{s.adres}</span>
            </p>
          )}
        </div>
      </div>

      {/* durum ve puan */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <DurumRozeti durum={durum} t={t} dil={dil} beyaz={beyaz} />
        {puan && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium"
            style={{
              background: beyaz ? "rgba(255,255,255,.16)" : "var(--acik)",
              border: beyaz ? "1px solid rgba(255,255,255,.26)" : "1px solid rgba(0,0,0,.08)",
            }}
          >
            <span aria-hidden style={{ color: beyaz ? "#FFD36E" : "var(--renk)" }}>
              ★
            </span>
            <b>{puan.puan.toLocaleString(dil === "en" ? "en-US" : "tr-TR")}</b>
            <span className={solgun}>
              · {puan.adet} {t.yorumAdet}
            </span>
          </span>
        )}
      </div>

      <p className={`mt-5 max-w-[48ch] text-[16.5px] leading-[1.6] md:text-[18px] ${solgun}`}>
        {sec(s.slogan, s.sloganEn, dil) ?? t.heroAciklama}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          href={yol(`/${s.slug}/randevu`)}
          className="rounded-full px-8 py-4 text-[16.5px] font-semibold shadow-[0_18px_38px_-16px_rgba(0,0,0,.75)]"
          style={{
            background: beyaz ? "#fff" : "var(--koyu)",
            color: beyaz ? "var(--koyu)" : "#fff",
          }}
        >
          {t.randevuAl}
        </Link>
        <a
          href={`https://wa.me/${s.telefon}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-6 py-4 text-[16px] font-medium"
          style={{
            borderColor: beyaz ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.14)",
            color: beyaz ? "#fff" : "inherit",
          }}
        >
          {t.whatsapp}
        </a>
      </div>
    </>
  );
}

function DurumRozeti({
  durum,
  t,
  dil,
  beyaz,
}: {
  durum: Durum;
  t: Sozluk;
  dil: Dil;
  beyaz: boolean;
}) {
  const yazi = durum.acik
    ? doldur(t.kapanisaKadar, { saat: durum.kapanis })
    : durum.sonraki
      ? doldur(t.acilisBilgisi, {
          gun: t.gunler[durum.sonraki.haftaGunu],
          saat: durum.sonraki.acilis,
        })
      : "";

  const nokta = durum.acik ? "#2BA86A" : "#C2544F";

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-medium"
      style={{
        background: beyaz ? "rgba(255,255,255,.16)" : "var(--acik)",
        border: beyaz ? "1px solid rgba(255,255,255,.26)" : "1px solid rgba(0,0,0,.08)",
      }}
      lang={dil}
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: nokta }} />
      <b>{durum.acik ? t.suAnAcik : t.suAnKapali}</b>
      {yazi && <span className={beyaz ? "opacity-85" : "opacity-65"}>· {yazi}</span>}
    </span>
  );
}

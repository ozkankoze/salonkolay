import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DIL_CEREZI, dilSec, dilliAdres, sozluk } from "@/lib/dil";
import { tumSalonlarVeri } from "@/lib/salonVeri";
import { KATEGORILER, kategoriAdi, kategoriAlt, kategoriSalonSayisi, sehirYaz } from "@/lib/kategori";
import UstBar from "./_bolum/UstBar";
import AltBilgi from "./_bolum/AltBilgi";
import Arama from "./_bolum/Arama";
import Belir from "./_bolum/Belir";
import SalonKart from "./_bolum/SalonKart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dil?: string }>;
}): Promise<Metadata> {
  const { dil: adresDili } = await searchParams;
  const t = sozluk(dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value));
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
  const salonlar = await tumSalonlarVeri();
  const sehirler = [...new Set(salonlar.map(sehirYaz).filter((x): x is string => !!x))].sort();
  const a = (yol: string) => dilliAdres(yol, dil);
  const demoVar = salonlar.some((s) => s.demo);

  return (
    <div lang={dil} className="bg-p-zemin text-p-murekkep">
      <UstBar dil={dil} t={t} />

      {/* ─────────────────────────── hero ─────────────────────────── */}
      <section className="relative overflow-hidden pt-[68px]">
        {/* Sıcak zemin: köşeden gelen bej bir ışık. Fotoğrafın arkasında
            değil, arama kutusunun uzağında duruyor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 h-[620px] w-[620px] rounded-full opacity-70 blur-[90px]"
          style={{ background: "radial-gradient(circle, #f0e3d3 0%, rgba(250,248,245,0) 70%)" }}
        />

        <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-5 pt-10 pb-16 sm:px-7 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-14 lg:pt-16 lg:pb-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-p-bej2" />
              <span className="text-[13px] font-medium tracking-[0.14em] text-p-silik">
                Salonkolay
              </span>
            </div>

            <h1 className="p-serif mt-6 text-[clamp(38px,6.1vw,60px)] leading-[1.04] tracking-[-0.02em] text-p-murekkep">
              {t.pHeroUst}
              <br />
              <span className="text-p-vurgu">{t.pHeroAlt}</span>
            </h1>

            <p className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-p-gri">
              {t.pHeroAciklama}
            </p>

            <div className="mt-8 lg:mt-10">
              <Arama dil={dil} t={t} sehirler={sehirler} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-p-silik">
              {KATEGORILER.slice(0, 3).map((k) => (
                <Link
                  key={k.slug}
                  href={a(`/kesfet?kategori=${k.slug}`)}
                  className="p-odak transition-colors hover:text-p-vurgu"
                >
                  {kategoriAdi(k, dil)}
                </Link>
              ))}
            </div>
          </div>

          {/* Asimetrik üçlü: biri uzun, ikisi kaydırılmış. Hepsi gerçek
              salon fotoğrafı — stok görsel kullanmıyoruz. */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-5 grid-rows-6 gap-4 [height:520px]">
              <div className="col-span-3 row-span-6 overflow-hidden rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/salon/k1.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-[22px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/salon/s1.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-[22px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/salon/k3.jpg" alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Mobilde yan yana üç kare — kaydırmadan görünsün, metni
              aşağı itmesin diye alçak. */}
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 lg:hidden [scrollbar-width:none]">
            {["/salon/k1.jpg", "/salon/s1.jpg", "/salon/k3.jpg"].map((g) => (
              <div key={g} className="h-[150px] w-[46%] shrink-0 overflow-hidden rounded-[20px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── kategoriler ───────────────────────── */}
      <section id="kategoriler" className="scroll-mt-20 border-t border-p-cizgi bg-p-zemin">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 sm:py-24">
          <Belir>
            <h2 className="p-serif max-w-[520px] text-[clamp(28px,4.4vw,42px)] leading-[1.1] tracking-[-0.015em]">
              {t.pKatBaslik}
            </h2>
            <p className="mt-3 max-w-[460px] text-[16px] text-p-gri">{t.pKatAciklama}</p>
          </Belir>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {KATEGORILER.map((k, i) => {
              const sayi = kategoriSalonSayisi(salonlar, k.slug);
              return (
                <Belir key={k.slug} gecikme={i * 55}>
                  <Link
                    href={a(`/kesfet?kategori=${k.slug}`)}
                    className="p-kart p-odak group relative flex h-full min-h-[172px] flex-col justify-between overflow-hidden rounded-[22px] p-5 sm:min-h-[200px] sm:p-6"
                    style={{ background: k.zemin }}
                  >
                    <svg
                      viewBox="0 0 48 48"
                      aria-hidden
                      className="h-10 w-10 transition-transform duration-500 group-hover:scale-110 sm:h-12 sm:w-12"
                    >
                      <path
                        d={k.cizim}
                        fill="none"
                        stroke={k.muren}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <div>
                      <h3
                        className="p-serif text-[19px] leading-tight sm:text-[22px]"
                        style={{ color: k.muren }}
                      >
                        {kategoriAdi(k, dil)}
                      </h3>
                      <p className="mt-1 text-[13.5px] text-p-gri">{kategoriAlt(k, dil)}</p>
                      <p className="mt-3 text-[12.5px] font-medium" style={{ color: k.muren }}>
                        {sayi > 0 ? `${sayi} ${t.pKatSalonSayisi}` : t.pKatYakinda}
                      </p>
                    </div>
                  </Link>
                </Belir>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────── öne çıkan salonlar ────────────────────── */}
      <section className="p-gecis border-t border-p-cizgi">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 sm:py-24">
          <Belir>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="p-serif text-[clamp(28px,4.4vw,42px)] leading-[1.1] tracking-[-0.015em]">
                  {t.pSalonBaslik}
                </h2>
                <p className="mt-3 text-[16px] text-p-gri">{t.pSalonAciklama}</p>
              </div>
              <Link
                href={a("/kesfet")}
                className="p-odak text-[15px] font-medium text-p-vurgu transition-colors hover:text-p-vurgu2"
              >
                {t.pSalonHepsi} →
              </Link>
            </div>
          </Belir>

          {/* Kolon sayısı kart sayısına göre: tek salonla üç kolonluk
              ızgara açarsak yanında kocaman bir boşluk kalıyor. */}
          <div
            className={`mt-10 grid gap-5 sm:grid-cols-2 ${
              salonlar.length + 1 > 2 ? "lg:grid-cols-3" : ""
            }`}
          >
            {salonlar.map((s, i) => (
              <Belir key={s.slug} gecikme={i * 70}>
                <SalonKart salon={s} dil={dil} t={t} oncelikli={i === 0} />
              </Belir>
            ))}

            {/* Boş kart yerine davet. Sahte salon üretmiyoruz; listeyi
                dolu göstermek için uydurma kayıt eklemek, ziyaretçiye
                yalan söylemek olurdu. */}
            <Belir gecikme={salonlar.length * 70}>
              <Link
                href={a("/salon-ekle")}
                className="p-kart p-odak flex h-full min-h-[220px] flex-col justify-end rounded-[24px] border border-dashed border-p-bej2 bg-p-kart/60 p-6 sm:min-h-[320px]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-p-bej2 text-p-vurgu">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 className="p-serif mt-5 text-[21px] leading-tight">{t.pSalonEkle}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-p-gri">{t.pSahipAciklama}</p>
              </Link>
            </Belir>
          </div>

          {demoVar && (
            <p className="mt-6 text-[13.5px] text-p-silik">{t.pSalonDemoNot}</p>
          )}
        </div>
      </section>

      {/* ───────────────────────── nasıl çalışır ───────────────────────── */}
      <section id="nasil" className="scroll-mt-20 border-t border-p-cizgi bg-p-bej">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 sm:py-24">
          <Belir>
            <h2 className="p-serif max-w-[680px] text-[clamp(28px,4.6vw,46px)] leading-[1.08] tracking-[-0.018em]">
              {t.pNasilBaslik}
            </h2>
          </Belir>

          {/* Üç ikonlu kutu değil: numaralar büyük, aralarında ince bir
              çizgi, kartlar kademeli olarak aşağı kayıyor. */}
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {[
              [t.pNasil1, t.pNasil1Alt],
              [t.pNasil2, t.pNasil2Alt],
              [t.pNasil3, t.pNasil3Alt],
            ].map(([bas, alt], i) => (
              <Belir key={bas} gecikme={i * 110} className={i === 1 ? "md:mt-10" : i === 2 ? "md:mt-20" : ""}>
                <li className="relative list-none">
                  <span
                    className="p-serif block text-[76px] leading-none text-p-bej2 select-none sm:text-[92px]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="mt-3 mb-5 block h-px w-full max-w-[140px] bg-p-vurgu/35"
                  />
                  <h3 className="p-serif text-[23px] leading-tight text-p-murekkep">{bas}</h3>
                  <p className="mt-2 max-w-[320px] text-[15.5px] leading-relaxed text-p-gri">{alt}</p>
                </li>
              </Belir>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────────────────── vitrin ─────────────────────────── */}
      <section className="border-t border-p-cizgi bg-p-zemin">
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-12 px-5 py-20 sm:px-7 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <Belir>
            <h2 className="p-serif text-[clamp(28px,4.6vw,46px)] leading-[1.08] tracking-[-0.018em]">
              {t.pVitrinUst}
              <br />
              <span className="text-p-vurgu">{t.pVitrinAlt}</span>
            </h2>
            <p className="mt-5 max-w-[420px] text-[17px] leading-relaxed text-p-gri">
              {t.pVitrinAciklama}
            </p>
            {salonlar[0] && (
              <Link
                href={a(`/${salonlar[0].slug}`)}
                className="p-odak mt-8 inline-flex items-center gap-2 rounded-full border border-p-murekkep px-6 py-3.5 text-[15.5px] font-medium text-p-murekkep transition-colors hover:bg-p-murekkep hover:text-white"
              >
                {t.pVitrinDugme}
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </Belir>

          <Belir gecikme={120}>
            <div className="relative mx-auto w-[280px] sm:w-[320px]">
              <div
                aria-hidden
                className="absolute -inset-10 rounded-full opacity-80 blur-[70px]"
                style={{ background: "radial-gradient(circle, #f1e2e6 0%, rgba(250,248,245,0) 70%)" }}
              />
              {/* Telefon gövdesi CSS ile; içindeki görüntü gerçek salon
                  sayfasının ekran görüntüsü. */}
              <div className="relative rounded-[44px] border border-p-cizgi bg-p-murekkep p-2.5 shadow-[0_40px_80px_-40px_rgba(26,25,23,.55)]">
                <div className="relative overflow-hidden rounded-[34px] bg-white">
                  <span
                    aria-hidden
                    className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-p-murekkep"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/vitrin/pinar-mobil.jpg"
                    alt="Pınar Kuaför"
                    className="block w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </Belir>
        </div>
      </section>

      {/* ───────────────────── salon sahipleri için ───────────────────── */}
      <section className="relative overflow-hidden bg-p-murekkep text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full opacity-25 blur-[90px]"
          style={{ background: "radial-gradient(circle, #9b4a5a 0%, rgba(26,25,23,0) 70%)" }}
        />
        <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-20 sm:px-7 sm:py-24 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <Belir>
            <h2 className="p-serif text-[clamp(30px,5vw,50px)] leading-[1.06] tracking-[-0.02em]">
              {t.pSahipUst}
              <br />
              {t.pSahipAlt}
            </h2>
            <p className="mt-5 max-w-[420px] text-[17px] leading-relaxed text-white/70">
              {t.pSahipAciklama}
            </p>
            <Link
              href={a("/salon-ekle")}
              className="p-odak mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[16px] font-medium text-p-murekkep transition-colors hover:bg-p-bej"
            >
              {t.pSalonEkle}
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Belir>

          <Belir gecikme={120}>
            <ul className="space-y-0">
              {[
                [t.pSahip1, t.pSahip1Alt],
                [t.pSahip2, t.pSahip2Alt],
                [t.pSahip3, t.pSahip3Alt],
              ].map(([bas, alt]) => (
                <li key={bas} className="border-b border-white/12 py-5 first:pt-0 last:border-0">
                  <h3 className="text-[17px] font-medium">{bas}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/60">{alt}</p>
                </li>
              ))}
            </ul>
          </Belir>
        </div>
      </section>

      <AltBilgi dil={dil} t={t} />
    </div>
  );
}

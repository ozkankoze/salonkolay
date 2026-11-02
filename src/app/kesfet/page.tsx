import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DIL_CEREZI, dilSec, dilliAdres, sozluk } from "@/lib/dil";
import { tumSalonlarVeri } from "@/lib/salonVeri";
import {
  KATEGORILER,
  kategoriAdi,
  kategoriBul,
  kategoriSalonSayisi,
  salonAra,
  sehirYaz,
} from "@/lib/kategori";
import UstBar from "../_bolum/UstBar";
import AltBilgi from "../_bolum/AltBilgi";
import Arama from "../_bolum/Arama";
import Belir from "../_bolum/Belir";
import SalonKart from "../_bolum/SalonKart";

export const dynamic = "force-dynamic";

type Sorgu = { dil?: string; q?: string; yer?: string; kategori?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Sorgu>;
}): Promise<Metadata> {
  const { dil: adresDili } = await searchParams;
  const t = sozluk(dilSec(adresDili, (await cookies()).get(DIL_CEREZI)?.value));
  return { title: t.kBaslik, description: t.kAciklama };
}

export default async function Kesfet({ searchParams }: { searchParams: Promise<Sorgu> }) {
  const sp = await searchParams;
  const dil = dilSec(sp.dil, (await cookies()).get(DIL_CEREZI)?.value);
  const t = sozluk(dil);
  const a = (yol: string) => dilliAdres(yol, dil);

  const hepsi = await tumSalonlarVeri();
  const sehirler = [...new Set(hepsi.map(sehirYaz).filter((x): x is string => !!x))].sort();

  const secili = sp.kategori && kategoriBul(sp.kategori) ? sp.kategori : undefined;
  const yer = sp.yer && sehirler.includes(sp.yer) ? sp.yer : undefined;

  let sonuc = salonAra(hepsi, { metin: sp.q, kategori: secili, dil });
  if (yer) sonuc = sonuc.filter((s) => sehirYaz(s) === yer);

  const filtreVar = !!(sp.q?.trim() || secili || yer);

  /** Filtre bağlantısı — diğer parametreleri koruyarak kategori değiştirir. */
  function kategoriAdresi(slug?: string): string {
    const p = new URLSearchParams();
    if (sp.q?.trim()) p.set("q", sp.q.trim());
    if (yer) p.set("yer", yer);
    if (slug) p.set("kategori", slug);
    const s = p.toString();
    return a("/kesfet" + (s ? `?${s}` : ""));
  }

  return (
    <div lang={dil} className="flex min-h-screen flex-col bg-p-zemin text-p-murekkep">
      <UstBar dil={dil} t={t} />

      <main className="flex-1 pt-[68px]">
        <div className="border-b border-p-cizgi bg-p-zemin">
          <div className="mx-auto w-full max-w-[1180px] px-5 pt-12 pb-8 sm:px-7 sm:pt-16">
            <h1 className="p-serif text-[clamp(30px,5vw,48px)] leading-[1.06] tracking-[-0.018em]">
              {t.kBaslik}
            </h1>
            <p className="mt-3 max-w-[460px] text-[16px] text-p-gri">{t.kAciklama}</p>

            <div className="mt-7 max-w-[760px]">
              <Arama
                dil={dil}
                t={t}
                sehirler={sehirler}
                baslangic={{ metin: sp.q, yer }}
                boyut="orta"
              />
            </div>
          </div>
        </div>

        {/* kategori şeridi — mobilde yatay kayar */}
        <div id="kategoriler" className="scroll-mt-20 border-b border-p-cizgi bg-p-zemin">
          <div className="serit mx-auto flex w-full max-w-[1180px] gap-2 overflow-x-auto px-5 py-4 sm:px-7">
            <Link
              href={kategoriAdresi()}
              className={`p-odak shrink-0 rounded-full border px-4 py-2 text-[14.5px] transition-colors ${
                !secili
                  ? "border-p-murekkep bg-p-murekkep text-white"
                  : "border-p-cizgi text-p-gri hover:border-p-bej2"
              }`}
            >
              {t.kTumKategoriler}
            </Link>
            {KATEGORILER.map((k) => {
              const sayi = kategoriSalonSayisi(hepsi, k.slug);
              const aktif = secili === k.slug;
              return (
                <Link
                  key={k.slug}
                  href={kategoriAdresi(k.slug)}
                  className={`p-odak flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[14.5px] transition-colors ${
                    aktif
                      ? "border-p-murekkep bg-p-murekkep text-white"
                      : "border-p-cizgi text-p-gri hover:border-p-bej2"
                  }`}
                >
                  {kategoriAdi(k, dil)}
                  <span className={aktif ? "text-white/60" : "text-p-silik"}>{sayi}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-7 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[14.5px] text-p-gri">
              <span className="font-medium text-p-murekkep">{sonuc.length}</span> {t.kSonuc}
            </p>
            {filtreVar && (
              <Link
                href={a("/kesfet")}
                className="p-odak text-[14px] text-p-vurgu transition-colors hover:text-p-vurgu2"
              >
                {t.kFiltreTemizle}
              </Link>
            )}
          </div>

          {sonuc.length > 0 ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sonuc.map((s, i) => (
                <Belir key={s.slug} gecikme={i * 60}>
                  <SalonKart salon={s} dil={dil} t={t} oncelikli={i === 0} />
                </Belir>
              ))}
            </div>
          ) : (
            /* ⚠️ BOŞ DURUM SÜSLENMİYOR. Salonkolay yeni; kategorilerin
               çoğunda henüz salon yok. Bunu gizleyip sahte kayıt
               göstermek yerine açıkça söylüyoruz. */
            <div className="mt-8 rounded-[24px] border border-dashed border-p-bej2 bg-p-kart/60 px-6 py-14 text-center">
              <h2 className="p-serif text-[24px] leading-tight">{t.kBosBaslik}</h2>
              <p className="mx-auto mt-3 max-w-[440px] text-[15.5px] leading-relaxed text-p-gri">
                {t.kBosAciklama}
              </p>
              <Link
                href={a("/salon-ekle")}
                className="p-odak mt-7 inline-flex items-center gap-2 rounded-full bg-p-murekkep px-6 py-3.5 text-[15.5px] font-medium text-white transition-colors hover:bg-p-vurgu2"
              >
                {t.kBosDugme}
              </Link>
            </div>
          )}
        </div>
      </main>

      <AltBilgi dil={dil} t={t} />
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { salonGetir } from "@/lib/salonVeri";
import { randevuBul } from "@/lib/depo";
import { randevuImzaDogru } from "@/lib/sifre";
import { saatYaz } from "@/lib/saat";
import { fiyatYaz, sureYaz } from "@/lib/salon";
import { gunYaz, telefonYaz, waLink } from "@/lib/bicim";
import Iptal from "./Iptal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Randevunuz",
  robots: { index: false, follow: false },
};

export default async function RandevuDetay({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { slug, id } = await params;
  const { k } = await searchParams;

  const s = await salonGetir(slug);
  if (!s) notFound();

  // Bağlantıdaki imza doğru değilse randevu hiç gösterilmez.
  if (!randevuImzaDogru(id, k)) {
    return (
      <Kabuk salon={s}>
        <h1 className="text-[24px] font-bold" style={{ color: s.koyu }}>
          Bağlantı geçersiz
        </h1>
        <p className="mt-2.5 text-[15.5px] leading-relaxed text-gri">
          Bu bağlantı eksik veya hatalı görünüyor. Randevunuzla ilgili bir sorun varsa salonu
          arayabilirsiniz.
        </p>
        <a
          href={`tel:+${s.telefon}`}
          className="mt-6 inline-block rounded-full px-6 py-3.5 text-[15.5px] font-semibold text-white"
          style={{ background: s.koyu }}
        >
          {telefonYaz(s.telefon)}
        </a>
      </Kabuk>
    );
  }

  const r = await randevuBul(slug, id);
  if (!r) notFound();

  const hizmetler = s.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
  const kisi = s.personel.find((p) => p.id === r.personelId);
  const tutar = hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0);
  const iptalEdildi = r.durum === "iptal";

  const mesaj = `Merhaba, ${gunYaz(r.gun)} ${saatYaz(r.baslangic)} randevum hakkında yazıyorum. (${r.ad})`;

  return (
    <Kabuk salon={s}>
      <p className="text-[12px] font-semibold tracking-[.18em] uppercase" style={{ color: s.renk }}>
        {iptalEdildi ? "İptal edildi" : "Randevunuz"}
      </p>
      <h1 className="mt-2 text-[27px] leading-tight font-bold sm:text-[31px]" style={{ color: s.koyu }}>
        {gunYaz(r.gun)}
        <br />
        saat {saatYaz(r.baslangic)}
      </h1>

      <div
        className={`mt-6 rounded-2xl border p-5 ${iptalEdildi ? "opacity-55" : ""}`}
        style={{ borderColor: "rgba(0,0,0,.08)", background: s.acikZemin }}
      >
        <Satir etiket="Ad" deger={r.ad} koyu={s.koyu} />
        <Satir etiket="Hizmet" deger={hizmetler.map((h) => h.ad).join(", ")} koyu={s.koyu} />
        {kisi && <Satir etiket="Kim bakacak" deger={kisi.ad} koyu={s.koyu} />}
        <Satir etiket="Süre" deger={sureYaz(r.dakika)} koyu={s.koyu} />
        {tutar > 0 && <Satir etiket="Tutar" deger={fiyatYaz(tutar) ?? ""} koyu={s.koyu} />}
        {r.not && <Satir etiket="Notunuz" deger={r.not} koyu={s.koyu} />}
      </div>

      {iptalEdildi ? (
        <div className="mt-6">
          <Link
            href={`/${s.slug}/randevu`}
            className="block rounded-xl py-3.5 text-center text-[15.5px] font-semibold text-white"
            style={{ background: s.koyu }}
          >
            Yeni randevu al
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <Iptal salon={s.slug} id={r.id} anahtar={k!} renk={s.renk} koyu={s.koyu} />

          <div className="flex gap-2">
            <a
              href={`tel:+${s.telefon}`}
              className="flex-1 rounded-xl border py-3.5 text-center text-[15px] font-medium"
              style={{ borderColor: "rgba(0,0,0,.15)", color: s.koyu }}
            >
              Salonu ara
            </a>
            <a
              href={waLink(s.telefon, mesaj)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-xl border py-3.5 text-center text-[15px] font-medium"
              style={{ borderColor: "rgba(0,0,0,.15)", color: s.koyu }}
            >
              WhatsApp
            </a>
          </div>

          <p className="pt-1 text-center text-[13px] leading-relaxed text-silik">
            Saati değiştirmek isterseniz önce iptal edip yeniden randevu alabilir ya da salonu
            arayabilirsiniz.
          </p>
        </div>
      )}

      {s.demo && (
        <p
          className="mt-8 rounded-2xl border border-dashed p-4 text-[13px] leading-relaxed text-gri"
          style={{ borderColor: "rgba(0,0,0,.2)" }}
        >
          <b style={{ color: s.koyu }}>Bu bir demo sayfadır.</b> Gerçek bir randevu değildir.
        </p>
      )}
    </Kabuk>
  );
}

function Satir({ etiket, deger, koyu }: { etiket: string; deger: string; koyu: string }) {
  return (
    <div className="flex gap-4 border-b border-black/[.06] py-2.5 last:border-0">
      <span className="w-[108px] shrink-0 text-[14px] text-silik">{etiket}</span>
      <span className="min-w-0 flex-1 text-[15px] font-medium" style={{ color: koyu }}>
        {deger}
      </span>
    </div>
  );
}

async function Kabuk({
  salon,
  children,
}: {
  salon: Awaited<ReturnType<typeof salonGetir>> & object;
  children: React.ReactNode;
}) {
  const s = salon;
  return (
    <div className="min-h-dvh" style={{ background: s.zemin }}>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "rgba(0,0,0,.07)", background: "rgba(255,255,255,.88)" }}
      >
        <div className="mx-auto flex h-16 max-w-[560px] items-center gap-2.5 px-5">
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
        </div>
      </header>
      <main className="mx-auto max-w-[560px] px-5 pt-9 pb-20">{children}</main>
    </div>
  );
}

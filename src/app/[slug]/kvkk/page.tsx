import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { salonGetir } from "@/lib/salonVeri";
import { aydinlatmaMetni } from "@/lib/kvkk";

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
    title: `Kişisel verilerin korunması — ${s.ad}`,
    description: `${s.ad} randevu sayfasında işlenen kişisel veriler hakkında aydınlatma metni.`,
    robots: { index: false, follow: true },
  };
}

/** **kalın** işaretlerini kalın metne çevirir. */
function kalinla(metin: string, anahtar: string) {
  return metin.split(/(\*\*[^*]+\*\*)/g).map((parca, i) =>
    parca.startsWith("**") && parca.endsWith("**") ? (
      <b key={`${anahtar}-${i}`}>{parca.slice(2, -2)}</b>
    ) : (
      <span key={`${anahtar}-${i}`}>{parca}</span>
    )
  );
}

export default async function Kvkk({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await salonGetir(slug);
  if (!s) notFound();

  const bolumler = aydinlatmaMetni(s);

  return (
    <div className="min-h-dvh" style={{ background: s.zemin }}>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "rgba(0,0,0,.07)", background: "rgba(255,255,255,.88)" }}
      >
        <div className="mx-auto flex h-16 max-w-[720px] items-center gap-3 px-5">
          <Link
            href={`/${s.slug}/randevu`}
            aria-label="Randevu sayfasına dön"
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: s.koyu }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="truncate text-[15px] font-semibold" style={{ color: s.koyu }}>
            {s.ad}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pt-9 pb-20">
        <p className="text-[12px] font-semibold tracking-[.18em] uppercase" style={{ color: s.renk }}>
          KVKK
        </p>
        <h1
          className="mt-2 text-[27px] leading-tight font-bold sm:text-[32px]"
          style={{ color: s.koyu }}
        >
          Kişisel verilerin korunması
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-gri">
          Randevu alırken paylaştığınız bilgilerin ne olduğunu, neden alındığını ve ne kadar
          saklandığını burada açıkça yazdık.
        </p>

        <div className="mt-8 space-y-6">
          {bolumler.map((b) => (
            <section
              key={b.baslik}
              className="rounded-2xl border p-5"
              style={{ borderColor: "rgba(0,0,0,.08)", background: s.acikZemin }}
            >
              <h2 className="text-[17px] font-semibold" style={{ color: s.koyu }}>
                {b.baslik}
              </h2>
              {b.paragraflar.map((p, i) => (
                <p key={i} className="mt-2.5 text-[15px] leading-relaxed text-gri">
                  {kalinla(p, `${b.baslik}-${i}`)}
                </p>
              ))}
            </section>
          ))}
        </div>

        {s.demo && (
          <p
            className="mt-8 rounded-2xl border border-dashed p-5 text-[13.5px] leading-relaxed text-gri"
            style={{ borderColor: "rgba(0,0,0,.2)" }}
          >
            <b style={{ color: s.koyu }}>Bu bir demo sayfadır.</b> Buradaki salon bilgileri örnektir;
            metin gerçek bir işletmeye ait değildir.
          </p>
        )}

        <div className="mt-8">
          <Link
            href={`/${s.slug}/randevu`}
            className="inline-block rounded-full px-6 py-3.5 text-[15.5px] font-semibold text-white"
            style={{ background: s.koyu }}
          >
            Randevu sayfasına dön
          </Link>
        </div>
      </main>
    </div>
  );
}

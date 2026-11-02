import Link from "next/link";
import type { Dil, Sozluk } from "@/lib/dil";
import { dilliAdres } from "@/lib/dil";
import { KATEGORILER, kategoriAdi } from "@/lib/kategori";
import Logo from "./Logo";

/**
 * ALT BİLGİ
 *
 * Geniş, sakin, üç sütun. Bağlantıların hepsi var olan bir yere
 * gidiyor — henüz olmayan sayfa için bağlantı koymuyoruz.
 */
export default function AltBilgi({ dil, t }: { dil: Dil; t: Sozluk }) {
  const a = (yol: string) => dilliAdres(yol, dil);
  const yil = new Date().getFullYear();

  return (
    <footer className="border-t border-p-cizgi bg-p-zemin">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-7 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[280px] text-[14.5px] leading-relaxed text-p-gri">
              {t.pAltAciklama}
            </p>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.1em] text-p-silik">
              {t.pAltKategoriler}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {KATEGORILER.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={a(`/kesfet?kategori=${k.slug}`)}
                    className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu"
                  >
                    {kategoriAdi(k, dil)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.1em] text-p-silik">
              {t.pAltKurumsal}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href={a("/kesfet")} className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  {t.pKesfet}
                </Link>
              </li>
              <li>
                <Link href={a("/#nasil")} className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  {t.pNasil}
                </Link>
              </li>
              <li>
                <Link href={a("/salon-ekle")} className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  {t.pSalonEkle}
                </Link>
              </li>
              <li>
                <Link href="/panel" className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  {t.pGiris}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.1em] text-p-silik">
              {t.pAltIletisim}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="tel:+905370108611" className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  0537 010 86 11
                </a>
              </li>
              <li>
                <a href="mailto:info@medya333.com" className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  info@medya333.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/medya333_tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href={a("/pinar/kvkk")} className="p-odak text-[14.5px] text-p-gri transition-colors hover:text-p-vurgu">
                  KVKK
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-p-cizgi pt-6 text-[13.5px] text-p-silik sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {yil} Salonkolay · {t.pAltHaklar}
          </span>
          <a
            href="https://medya333.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-odak transition-colors hover:text-p-vurgu"
          >
            Medya 333
          </a>
        </div>
      </div>
    </footer>
  );
}

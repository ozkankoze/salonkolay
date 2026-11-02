import Link from "next/link";
import type { Salon } from "@/lib/salon";
import type { Dil, Sozluk } from "@/lib/dil";
import { dilliAdres, sec } from "@/lib/dil";
import { kategoriAdi, salonKategorileri, sehirYaz } from "@/lib/kategori";
import { salonDurumu } from "@/lib/saat";

/**
 * SALON KARTI
 *
 * ⚠️ PUAN GÖSTERMİYORUZ. Tohum kayıttaki yorum ve "4,9 Google puanı"
 * satırları, sistemin nasıl göründüğünü anlatmak için yazılmış örnek
 * verilerdir; gerçek müşteri değerlendirmesi değildir. Kartta puan
 * göstermek, olmayan bir ölçümü varmış gibi sunmak olurdu. Gerçek
 * değerlendirme toplandığında burası açılır.
 */
export default function SalonKart({
  salon,
  dil,
  t,
  oncelikli = false,
}: {
  salon: Salon;
  dil: Dil;
  t: Sozluk;
  /** İlk kart hero'ya yakın — görseli erken yüklensin. */
  oncelikli?: boolean;
}) {
  const sehir = sehirYaz(salon);
  const kategoriler = salonKategorileri(salon);
  const durum = salonDurumu(salon);
  const kapak = salon.kapak ?? salon.logo;

  return (
    <Link
      href={dilliAdres(`/${salon.slug}`, dil)}
      className="p-kart p-odak group block overflow-hidden rounded-[24px] border border-p-cizgi bg-p-kart"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-p-bej">
        {kapak && (
          // Görseller public/ içinde sabit dosyalar; next/image kurulumu
          // galeri yolları (/g/<id>.webp) ile karıştığı için düz img.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={kapak}
            alt={salon.ad}
            loading={oncelikli ? "eager" : "lazy"}
            className="p-gorsel h-full w-full object-cover"
          />
        )}

        {salon.demo && (
          <span className="absolute top-3 left-3 rounded-full bg-p-murekkep/80 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
            {t.pSalonDemo}
          </span>
        )}

        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[12px] font-medium backdrop-blur-sm ${
            durum.acik ? "bg-white/90 text-p-murekkep" : "bg-p-murekkep/60 text-white"
          }`}
        >
          {durum.acik ? t.pSalonBugun : t.pSalonKapali}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="p-serif text-[21px] leading-tight text-p-murekkep">{salon.ad}</h3>
          {sehir && <span className="shrink-0 text-[13.5px] text-p-silik">{sehir}</span>}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[14.5px] text-p-gri">
          {sec(salon.slogan ?? "", salon.sloganEn ?? salon.slogan ?? "", dil)}
        </p>

        {kategoriler.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {kategoriler.map((k) => (
              <span
                key={k.slug}
                className="rounded-full border border-p-cizgi px-2.5 py-1 text-[12.5px] text-p-gri"
              >
                {kategoriAdi(k, dil)}
              </span>
            ))}
          </div>
        )}

        <span className="mt-5 flex items-center gap-1.5 text-[14.5px] font-medium text-p-vurgu">
          {t.pSalonIncele}
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
            <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

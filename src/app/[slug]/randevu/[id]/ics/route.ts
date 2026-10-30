import { salonGetir } from "@/lib/salonVeri";
import { randevuBul } from "@/lib/depo";
import { randevuImzaDogru } from "@/lib/sifre";
import { saatYaz } from "@/lib/saat";
import { icsMetni } from "@/lib/takvim";
import { siteKoku } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Randevuyu müşterinin takvimine indirir. İmzasız erişilemez. */
export async function GET(
  istek: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const k = new URL(istek.url).searchParams.get("k") ?? undefined;
  if (!randevuImzaDogru(id, k)) return new Response("Geçersiz bağlantı", { status: 403 });

  const [salon, r] = await Promise.all([salonGetir(slug), randevuBul(slug, id)]);
  if (!salon || !r || r.durum === "iptal") return new Response("Bulunamadı", { status: 404 });

  const hizmetler = salon.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
  const metin = icsMetni({
    baslik: `${salon.ad} — ${hizmetler.map((h) => h.ad).join(", ")}`,
    gun: r.gun,
    baslangic: r.baslangic,
    dakika: r.dakika,
    yer: salon.adres,
    not: `Randevunuz: ${saatYaz(r.baslangic)}`,
    adres: `${siteKoku()}/${slug}/randevu/${id}?k=${k}`,
  });

  return new Response(metin, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="randevu-${r.gun}.ics"`,
      "cache-control": "no-store",
    },
  });
}

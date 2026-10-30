import { NextResponse, after } from "next/server";
import { salonGetir } from "@/lib/salonVeri";
import { dkCevir, personelSec, yerUygunMu } from "@/lib/saat";
import { randevuImza } from "@/lib/sifre";
import { yeniRandevuBildir } from "@/lib/bildirim";
import { randevuEkle, salonunKapaliklari, salonunRandevulari } from "@/lib/depo";

export const dynamic = "force-dynamic";

export async function POST(istek: Request) {
  let g: Record<string, unknown>;
  try {
    g = await istek.json();
  } catch {
    return NextResponse.json({ hata: "İstek okunamadı" }, { status: 400 });
  }

  const slug = String(g.salon ?? "");
  const salon = await salonGetir(slug);
  if (!salon) return NextResponse.json({ hata: "Salon bulunamadı" }, { status: 404 });

  const gun = String(g.gun ?? "");
  const saat = String(g.saat ?? "");
  const hizmetIds = Array.isArray(g.hizmetIds) ? (g.hizmetIds as string[]) : [];
  const ad = String(g.ad ?? "").trim();
  const telefon = String(g.telefon ?? "").replace(/\D/g, "");
  const not = g.not ? String(g.not).slice(0, 300) : undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun) || !/^\d{2}:\d{2}$/.test(saat))
    return NextResponse.json({ hata: "Tarih veya saat geçersiz" }, { status: 400 });
  if (ad.length < 2) return NextResponse.json({ hata: "Adınızı yazar mısınız?" }, { status: 400 });
  if (telefon.length < 10)
    return NextResponse.json({ hata: "Telefon numarası eksik görünüyor." }, { status: 400 });
  // KVKK onayı olmadan kayıt açılmaz — istek doğrudan API'ye gelse bile.
  if (g.kvkk !== true)
    return NextResponse.json(
      { hata: "Devam etmek için aydınlatma metnini onaylayın." },
      { status: 400 }
    );

  const hizmetler = salon.hizmetler.filter((h) => hizmetIds.includes(h.id));
  if (hizmetler.length === 0)
    return NextResponse.json({ hata: "Hizmet seçilmemiş" }, { status: 400 });

  const toplamDk = hizmetler.reduce((t, h) => t + h.dakika, 0);
  const baslangic = dkCevir(saat);
  const [mevcut, kapaliklar] = await Promise.all([
    salonunRandevulari(slug),
    salonunKapaliklari(slug),
  ]);

  // "farketmez" ise o saatte boş olan personeli burada seçiyoruz
  let personelId = String(g.personelId ?? "farketmez");
  if (personelId === "farketmez") {
    const secilen = personelSec(salon, gun, baslangic, toplamDk, hizmetIds, mevcut, kapaliklar);
    if (!secilen)
      return NextResponse.json(
        { hata: "Bu saat az önce doldu. Başka bir saat seçer misiniz?" },
        { status: 409 }
      );
    personelId = secilen;
  } else if (!yerUygunMu(salon, gun, baslangic, toplamDk, personelId, mevcut, kapaliklar)) {
    return NextResponse.json(
      { hata: "Bu saat az önce doldu. Başka bir saat seçer misiniz?" },
      { status: 409 }
    );
  }

  const r = await randevuEkle({
    salon: slug,
    gun,
    baslangic,
    dakika: toplamDk,
    personelId,
    hizmetIds,
    ad,
    telefon,
    not,
  });

  // Bildirim yanıtı bekletmesin: müşteri onay ekranını hemen görsün,
  // e-posta arkadan gitsin.
  after(() => yeniRandevuBildir(salon, r));

  // Müşteri randevusunu bu anahtarla görüntüleyip iptal edebilir.
  return NextResponse.json({ id: r.id, personelId, anahtar: randevuImza(r.id) });
}

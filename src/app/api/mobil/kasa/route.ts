import { kasaEkle, kasaKayitlari, kasaSil } from "@/lib/depo";
import { bugunTR } from "@/lib/zaman";
import { govdeOku, hata, istekSalonu, jsonCevap } from "@/lib/mobil";

export const dynamic = "force-dynamic";

/**
 * KASA
 *
 * GET    ?ay=2026-11            -> { ay, kayitlar, gelir, gider }
 * POST   { tur, tutar, aciklama?, gun? }
 * DELETE { id }
 *
 * Panelin kasasıyla aynı tablo: uygulamadan girilen tahsilat panelde,
 * panelden girilen uygulamada görünüyor.
 */
export async function GET(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const istenen = new URL(istek.url).searchParams.get("ay") ?? "";
  const ay = /^\d{4}-\d{2}$/.test(istenen) ? istenen : bugunTR().slice(0, 7);

  const kayitlar = await kasaKayitlari(salon.slug, ay);
  const topla = (tur: "gelir" | "gider") =>
    kayitlar.filter((k) => k.tur === tur).reduce((t, k) => t + Number(k.tutar), 0);

  return jsonCevap({
    ay,
    bugun: bugunTR(),
    gelir: topla("gelir"),
    gider: topla("gider"),
    kayitlar: kayitlar.map((k) => ({
      id: k.id,
      gun: k.gun,
      tur: k.tur,
      tutar: Number(k.tutar),
      aciklama: k.aciklama ?? null,
      randevuId: k.randevuId ?? null,
    })),
  });
}

export async function POST(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const tur = g.tur === "gider" ? "gider" : g.tur === "gelir" ? "gelir" : null;
  if (!tur) return hata("Tür gelir ya da gider olmalı.", 400);

  // Virgüllü yazım da kabul: kuaför "350,50" yazıyor.
  const tutar = Number(String(g.tutar ?? "").replace(",", "."));
  if (!Number.isFinite(tutar) || tutar <= 0) return hata("Tutar geçersiz.", 400);
  if (tutar > 1_000_000) return hata("Tutar fazla büyük.", 400);

  const istenenGun = String(g.gun ?? "");
  const gun = /^\d{4}-\d{2}-\d{2}$/.test(istenenGun) ? istenenGun : bugunTR();
  const aciklama = String(g.aciklama ?? "").trim().slice(0, 140) || undefined;

  const k = await kasaEkle({
    salon: salon.slug,
    gun,
    tur,
    tutar: Math.round(tutar * 100) / 100,
    aciklama,
  });

  return jsonCevap({
    kayit: {
      id: k.id,
      gun: k.gun,
      tur: k.tur,
      tutar: Number(k.tutar),
      aciklama: k.aciklama ?? null,
      randevuId: k.randevuId ?? null,
    },
  });
}

export async function DELETE(istek: Request) {
  const salon = await istekSalonu(istek);
  if (!salon) return hata("Oturum geçersiz.", 401);

  const g = await govdeOku(istek);
  const id = String(g.id ?? "").trim();
  if (!id) return hata("Kayıt kimliği gerekli.", 400);

  // `kasaSil` salon adıyla birlikte siliyor: başka salonun kaydı silinemez.
  await kasaSil(salon.slug, id);
  return jsonCevap({ tamam: true });
}

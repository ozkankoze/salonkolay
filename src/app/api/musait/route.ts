import { NextResponse } from "next/server";
import { salonGetir } from "@/lib/salonVeri";
import { musaitSaatler } from "@/lib/saat";
import { simdiTR } from "@/lib/zaman";
import { salonunKapaliklari, salonunRandevulari } from "@/lib/depo";

export const dynamic = "force-dynamic";

export async function GET(istek: Request) {
  const u = new URL(istek.url);
  const slug = u.searchParams.get("salon") ?? "";
  const gun = u.searchParams.get("gun") ?? "";
  const dk = Number(u.searchParams.get("dk") ?? 0);
  const personel = u.searchParams.get("personel") ?? "farketmez";
  // Erteleme ekranı için: müşterinin kendi randevusu çakışma sayılmasın.
  const yok = u.searchParams.get("yok");

  const salon = await salonGetir(slug);
  if (!salon) return NextResponse.json({ hata: "Salon bulunamadı" }, { status: 404 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return NextResponse.json({ saatler: [] });

  const [mevcut, kapaliklar] = await Promise.all([
    salonunRandevulari(slug),
    salonunKapaliklari(slug),
  ]);
  const hesaba = yok ? mevcut.filter((r) => r.id !== yok) : mevcut;
  const saatler = musaitSaatler(salon, gun, dk, personel, hesaba, simdiTR(), kapaliklar);
  return NextResponse.json({ saatler });
}

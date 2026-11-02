/**
 * MOBİL API ORTAK PARÇALARI — yalnızca sunucu.
 *
 * Uygulama tarayıcı değil; çerez taşımıyor. Bu yüzden panelin çerezli
 * oturumuna dokunmadan, aynı imzalı jetonu `Authorization: Bearer <jeton>`
 * başlığıyla alıyoruz. Jetonu üreten ve çözen kod aynı (`sifre.ts`), yani
 * iki ayrı oturum sistemi yok — sadece iki ayrı taşıma biçimi.
 */

import { jetonCoz } from "./sifre";
import { salonGetir } from "./salonVeri";
import type { Salon } from "./salon";

export function jsonCevap(govde: unknown, durum = 200): Response {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Mobil cevapları hiçbir yerde önbelleğe alınmasın.
      "cache-control": "no-store",
    },
  });
}

export function hata(mesaj: string, durum = 400): Response {
  return jsonCevap({ hata: mesaj }, durum);
}

/** İstekteki jetondan salonu çözer. Jeton yoksa ya da geçersizse null. */
export async function istekSalonu(istek: Request): Promise<Salon | null> {
  const bas = istek.headers.get("authorization") ?? "";
  const jeton = bas.toLowerCase().startsWith("bearer ") ? bas.slice(7).trim() : "";
  const slug = jetonCoz(jeton || undefined);
  if (!slug) return null;
  return (await salonGetir(slug)) ?? null;
}

/** Gövdeyi güvenle okur; bozuk JSON gelirse boş nesne döner. */
export async function govdeOku(istek: Request): Promise<Record<string, unknown>> {
  try {
    const x = await istek.json();
    return x && typeof x === "object" ? (x as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Uygulamaya gönderilen salon özeti.
 *
 * Bütün salon kaydını yollamıyoruz: içinde şifre hash'i olmasa da
 * yorumlar, galeri ve KVKK'ya girecek metinler var; uygulamanın
 * bunlara ihtiyacı yok, mobil veriyi şişirir.
 */
export function salonOzeti(s: Salon) {
  return {
    slug: s.slug,
    ad: s.ad,
    kisaAd: s.kisaAd ?? null,
    telefon: s.telefon,
    renk: s.renk,
    koyu: s.koyu,
    aralikDk: s.aralikDk,
    ufukGun: s.ufukGun,
    hizmetler: s.hizmetler.map((h) => ({
      id: h.id,
      ad: h.ad,
      dakika: h.dakika,
      fiyat: h.fiyat ?? null,
      grup: h.grup ?? null,
    })),
    personel: s.personel.map((p) => ({
      id: p.id,
      ad: p.ad,
      unvan: p.unvan ?? null,
      hizmetler: p.hizmetler ?? null,
    })),
    calisma: s.calisma,
  };
}

/** Randevuyu uygulamanın beklediği biçime çevirir. */
export function randevuOzeti(s: Salon, r: import("./saat").Randevu) {
  const hizmetler = s.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
  return {
    id: r.id,
    gun: r.gun,
    baslangic: r.baslangic,
    dakika: r.dakika,
    ad: r.ad,
    telefon: r.telefon,
    not: r.not ?? null,
    durum: r.durum,
    kaynak: r.kaynak ?? "web",
    personelId: r.personelId,
    personel: s.personel.find((p) => p.id === r.personelId)?.ad ?? null,
    hizmetIds: r.hizmetIds,
    hizmetler: hizmetler.map((h) => h.ad),
    tutar: hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0) || null,
  };
}

"use server";

/**
 * Panelin bütün yazma işlemleri burada.
 * Her eylem önce oturumu doğrular; slug asla istemciden alınmaz.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cikisYap, girisDene, oturumSlug, sifreDegistir } from "@/lib/oturum";
import type { Calisma, Hizmet, Personel, Salon } from "@/lib/salon";
import { salonGetir, salonKaydet } from "@/lib/salonVeri";
import {
  durumDegistir,
  kapaliEkle,
  kapaliSil,
  kasaEkle,
  kasaSil,
  kasadaVarMi,
  randevuBul,
  randevuEkle,
  salonunKapaliklari,
  salonunRandevulari,
} from "@/lib/depo";
import { dkCevir, personelSec, yerUygunMu, type Randevu } from "@/lib/saat";
import { gorselKaydet, gorselSil, type GorselTuru } from "@/lib/gorsel";
import { denemePostasi, epostaGonder, epostaKuruluMu, gecerliEposta } from "@/lib/eposta";
import { siteKoku } from "@/lib/site";

async function slugAl(): Promise<string> {
  const s = await oturumSlug();
  if (!s) redirect("/panel");
  return s;
}

function tazele() {
  revalidatePath("/panel", "layout");
}

/* ───────── giriş / çıkış ───────── */

export async function girisEylem(_onceki: string | null, veri: FormData): Promise<string | null> {
  const slug = String(veri.get("slug") ?? "");
  const sifre = String(veri.get("sifre") ?? "");
  const oldu = await girisDene(slug, sifre);
  if (!oldu) return "Salon adı veya şifre hatalı.";
  redirect("/panel/bugun");
}

export async function cikisEylem(): Promise<void> {
  await cikisYap();
  redirect("/panel");
}

/* ───────── randevu durumu ───────── */

export async function durumEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  const id = String(veri.get("id") ?? "");
  const durum = String(veri.get("durum") ?? "") as Randevu["durum"];
  if (!["bekliyor", "onaylandi", "iptal", "geldi"].includes(durum)) return;
  await durumDegistir(slug, id, durum);
  tazele();
}

/** Randevu tutarını kasaya gelir olarak yazar. */
export async function kasayaYazEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  const id = String(veri.get("id") ?? "");
  if (await kasadaVarMi(slug, id)) return;

  const [salon, r] = await Promise.all([salonGetir(slug), randevuBul(slug, id)]);
  if (!salon || !r) return;

  const hizmetler = salon.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
  const tutar = hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0);
  await kasaEkle({
    salon: slug,
    gun: r.gun,
    tur: "gelir",
    tutar,
    aciklama: `${r.ad} — ${hizmetler.map((h) => h.ad).join(", ")}`,
    randevuId: r.id,
  });
  await durumDegistir(slug, id, "geldi");
  tazele();
}

/* ───────── kapalı saatler ───────── */

export async function kapaliEkleEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  const gun = String(veri.get("gun") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return;

  const tumGun = veri.get("tumGun") === "evet";
  const bas = String(veri.get("bas") ?? "");
  const bit = String(veri.get("bit") ?? "");
  const sebep = String(veri.get("sebep") ?? "").slice(0, 80) || undefined;

  if (tumGun) {
    await kapaliEkle({ salon: slug, gun, baslangic: null, bitis: null, sebep });
  } else {
    if (!/^\d{2}:\d{2}$/.test(bas) || !/^\d{2}:\d{2}$/.test(bit)) return;
    const b = dkCevir(bas);
    const s = dkCevir(bit);
    if (s <= b) return;
    await kapaliEkle({ salon: slug, gun, baslangic: b, bitis: s, sebep });
  }
  tazele();
}

export async function kapaliSilEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  await kapaliSil(slug, String(veri.get("id") ?? ""));
  tazele();
}

/* ───────── elle randevu (telefonla arayan müşteri) ───────── */

export async function elleRandevuEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";

  const gun = String(veri.get("gun") ?? "");
  const saat = String(veri.get("saat") ?? "");
  const ad = String(veri.get("ad") ?? "").trim();
  const telefon = String(veri.get("telefon") ?? "").replace(/\D/g, "");
  const hizmetIds = veri.getAll("hizmet").map(String);
  let personelId = String(veri.get("personel") ?? "farketmez");
  const not = String(veri.get("not") ?? "").slice(0, 300) || undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return "Gün seçilmemiş.";
  if (!/^\d{2}:\d{2}$/.test(saat)) return "Saat geçersiz.";
  if (ad.length < 2) return "Müşterinin adını yazın.";
  if (hizmetIds.length === 0) return "En az bir hizmet seçin.";

  const hizmetler = salon.hizmetler.filter((h) => hizmetIds.includes(h.id));
  const toplamDk = hizmetler.reduce((t, h) => t + h.dakika, 0);
  const baslangic = dkCevir(saat);

  const [mevcut, kapaliklar] = await Promise.all([
    salonunRandevulari(slug),
    salonunKapaliklari(slug),
  ]);

  if (personelId === "farketmez") {
    const secilen = personelSec(salon, gun, baslangic, toplamDk, hizmetIds, mevcut, kapaliklar);
    if (!secilen) return "O saatte boş personel yok.";
    personelId = secilen;
  } else if (!yerUygunMu(salon, gun, baslangic, toplamDk, personelId, mevcut, kapaliklar)) {
    return "O saat dolu veya kapalı.";
  }

  await randevuEkle({
    salon: slug,
    gun,
    baslangic,
    dakika: toplamDk,
    personelId,
    hizmetIds,
    ad,
    telefon,
    not,
    kaynak: "panel",
    durum: "onaylandi",
  });
  tazele();
  return "tamam";
}

/* ───────── kasa ───────── */

export async function kasaEkleEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const gun = String(veri.get("gun") ?? "");
  const tur = String(veri.get("tur") ?? "gelir") as "gelir" | "gider";
  const tutar = Number(String(veri.get("tutar") ?? "0").replace(",", "."));
  const aciklama = String(veri.get("aciklama") ?? "").slice(0, 120) || undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return "Gün geçersiz.";
  if (!Number.isFinite(tutar) || tutar <= 0) return "Tutar girin.";
  if (tur !== "gelir" && tur !== "gider") return "Tür geçersiz.";

  await kasaEkle({ salon: slug, gun, tur, tutar, aciklama });
  tazele();
  return "tamam";
}

export async function kasaSilEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  await kasaSil(slug, String(veri.get("id") ?? ""));
  tazele();
}

/* ───────── ayarlar ───────── */

export async function ayarKaydetEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";

  const yeni: Salon = { ...salon };

  const metin = (anahtar: string, uzunluk = 200) => {
    const d = veri.get(anahtar);
    if (d === null) return undefined;
    return String(d).trim().slice(0, uzunluk);
  };

  const ad = metin("ad", 60);
  if (ad !== undefined) {
    if (ad.length < 2) return "Salon adı çok kısa.";
    yeni.ad = ad;
  }
  const slogan = metin("slogan", 120);
  if (slogan !== undefined) yeni.slogan = slogan || undefined;
  const hakkinda = metin("hakkinda", 800);
  if (hakkinda !== undefined) yeni.hakkinda = hakkinda || undefined;
  const hakkindaBaslik = metin("hakkindaBaslik", 80);
  if (hakkindaBaslik !== undefined) yeni.hakkindaBaslik = hakkindaBaslik || undefined;
  const adres = metin("adres", 200);
  if (adres !== undefined) yeni.adres = adres || undefined;
  const instagram = metin("instagram", 40);
  if (instagram !== undefined) yeni.instagram = instagram.replace(/^@/, "") || undefined;


  const telefon = veri.get("telefon");
  if (telefon !== null) {
    const t = String(telefon).replace(/\D/g, "");
    if (t.length < 10) return "Telefon numarası eksik görünüyor.";
    yeni.telefon = t.startsWith("90") ? t : "90" + t.replace(/^0/, "");
  }

  // Hizmetler ve ekip istemcide düzenlenip JSON olarak geliyor.
  const hizmetJson = veri.get("hizmetler");
  if (hizmetJson !== null) {
    try {
      const liste = JSON.parse(String(hizmetJson)) as Hizmet[];
      const temiz: Hizmet[] = [];
      for (const h of liste) {
        const adi = String(h.ad ?? "").trim().slice(0, 60);
        const dk = Number(h.dakika);
        if (!adi || !Number.isFinite(dk) || dk < 5 || dk > 600) continue;
        temiz.push({
          id: String(h.id || "h" + Math.random().toString(36).slice(2, 7)),
          ad: adi,
          dakika: Math.round(dk),
          fiyat:
            h.fiyat === undefined || h.fiyat === null || Number.isNaN(Number(h.fiyat))
              ? undefined
              : Number(h.fiyat),
          aciklama: h.aciklama ? String(h.aciklama).slice(0, 80) : undefined,
          grup: h.grup ? String(h.grup).slice(0, 40) : undefined,
          adEn: h.adEn ? String(h.adEn).trim().slice(0, 60) || undefined : undefined,
          aciklamaEn: h.aciklamaEn ? String(h.aciklamaEn).trim().slice(0, 80) || undefined : undefined,
          grupEn: h.grupEn ? String(h.grupEn).trim().slice(0, 40) || undefined : undefined,
        });
      }
      if (temiz.length === 0) return "En az bir hizmet olmalı.";
      yeni.hizmetler = temiz;
    } catch {
      return "Hizmet listesi okunamadı.";
    }
  }

  const ekipJson = veri.get("personel");
  if (ekipJson !== null) {
    try {
      const liste = JSON.parse(String(ekipJson)) as Personel[];
      const temiz: Personel[] = [];
      for (const p of liste) {
        const adi = String(p.ad ?? "").trim().slice(0, 40);
        if (!adi) continue;
        temiz.push({
          id: String(p.id || "p" + Math.random().toString(36).slice(2, 7)),
          ad: adi,
          unvan: p.unvan ? String(p.unvan).slice(0, 60) : undefined,
          unvanEn: p.unvanEn ? String(p.unvanEn).trim().slice(0, 60) || undefined : undefined,
          foto: p.foto ? String(p.foto).slice(0, 200) : undefined,
          hizmetler: Array.isArray(p.hizmetler) && p.hizmetler.length ? p.hizmetler.map(String) : undefined,
        });
      }
      if (temiz.length === 0) return "En az bir kişi olmalı.";
      yeni.personel = temiz;
    } catch {
      return "Ekip listesi okunamadı.";
    }
  }

  // Çalışma saatleri
  if (veri.get("calisma_0_acilis") !== null) {
    const calisma: Calisma[] = [];
    for (let g = 0; g < 7; g++) {
      const kapali = veri.get(`calisma_${g}_kapali`) === "evet";
      const acilis = String(veri.get(`calisma_${g}_acilis`) ?? "09:00");
      const kapanis = String(veri.get(`calisma_${g}_kapanis`) ?? "19:00");
      if (!/^\d{2}:\d{2}$/.test(acilis) || !/^\d{2}:\d{2}$/.test(kapanis))
        return "Çalışma saati biçimi hatalı.";
      if (!kapali && dkCevir(kapanis) <= dkCevir(acilis))
        return "Kapanış saati açılıştan sonra olmalı.";
      calisma.push({ gun: g, acilis, kapanis, kapali: kapali || undefined });
    }
    yeni.calisma = calisma;
  }

  await salonKaydet(yeni);
  revalidatePath("/panel", "layout");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/randevu`);
  return null;
}

export async function sifreEylem(_onceki: string | null, veri: FormData): Promise<string | null> {
  const slug = await slugAl();
  const hata = await sifreDegistir(
    slug,
    String(veri.get("eski") ?? ""),
    String(veri.get("yeni") ?? "")
  );
  return hata ?? "tamam";
}

/* ───────── görseller ───────── */

const EN_COK_GALERI = 8;

export async function gorselYukleEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";

  const tur = String(veri.get("tur") ?? "") as GorselTuru;
  if (!["logo", "kapak", "galeri", "ekip"].includes(tur)) return "Görsel türü geçersiz.";

  const dosya = veri.get("dosya");
  if (!(dosya instanceof File)) return "Dosya seçilmedi.";

  if (tur === "galeri" && (salon.galeri?.length ?? 0) >= EN_COK_GALERI)
    return `Galeriye en fazla ${EN_COK_GALERI} fotoğraf konabilir. Önce birini silin.`;

  const sonuc = await gorselKaydet(slug, tur, dosya);
  if ("hata" in sonuc) return sonuc.hata;

  const yeni: Salon = { ...salon };

  if (tur === "logo") {
    if (yeni.logo) await gorselSil(slug, yeni.logo);
    yeni.logo = sonuc.url;
  } else if (tur === "kapak") {
    if (yeni.kapak) await gorselSil(slug, yeni.kapak);
    yeni.kapak = sonuc.url;
  } else if (tur === "galeri") {
    yeni.galeri = [...(yeni.galeri ?? []), sonuc.url];
  } else {
    const pid = String(veri.get("personelId") ?? "");
    const i = yeni.personel.findIndex((p) => p.id === pid);
    if (i < 0) return "Kişi bulunamadı.";
    const eski = yeni.personel[i].foto;
    if (eski) await gorselSil(slug, eski);
    yeni.personel = yeni.personel.map((p, j) => (j === i ? { ...p, foto: sonuc.url } : p));
  }

  await salonKaydet(yeni);
  tazele();
  revalidatePath(`/${slug}`);
  return "tamam";
}

export async function gorselSilEylem(veri: FormData): Promise<void> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return;

  const tur = String(veri.get("tur") ?? "");
  const yeni: Salon = { ...salon };

  if (tur === "logo" && yeni.logo) {
    await gorselSil(slug, yeni.logo);
    yeni.logo = undefined;
  } else if (tur === "kapak" && yeni.kapak) {
    await gorselSil(slug, yeni.kapak);
    yeni.kapak = undefined;
  } else if (tur === "galeri") {
    const url = String(veri.get("url") ?? "");
    if (!yeni.galeri?.includes(url)) return;
    await gorselSil(slug, url);
    yeni.galeri = yeni.galeri.filter((g) => g !== url);
  } else if (tur === "ekip") {
    const pid = String(veri.get("personelId") ?? "");
    const kisi = yeni.personel.find((p) => p.id === pid);
    if (!kisi?.foto) return;
    await gorselSil(slug, kisi.foto);
    yeni.personel = yeni.personel.map((p) => (p.id === pid ? { ...p, foto: undefined } : p));
  } else {
    return;
  }

  await salonKaydet(yeni);
  tazele();
  revalidatePath(`/${slug}`);
}

/* ───────── bildirim ayarı ───────── */

export async function bildirimAyarEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";

  const adres = String(veri.get("eposta") ?? "").trim().slice(0, 120);
  if (adres && !gecerliEposta(adres)) return "E-posta adresi geçerli görünmüyor.";

  await salonKaydet({
    ...salon,
    eposta: adres || undefined,
    bildirim: adres ? veri.get("bildirim") === "evet" : false,
  });
  tazele();
  return "tamam";
}

/* ───────── dil eklentisi ───────── */

/**
 * İngilizce eklentisinin açma/kapama anahtarı ve salonun kendi
 * metinlerinin İngilizce karşılıkları.
 *
 * Ayrı bir eylem: onay kutusu işaretsizken form verisine hiç girmiyor,
 * `ayarKaydetEylem`in "alan geldiyse değiştir" mantığı bunu ayırt edemezdi.
 */
export async function dilAyarEylem(
  _onceki: string | null,
  veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";

  const kes = (anahtar: string, uzunluk: number) =>
    String(veri.get(anahtar) ?? "").trim().slice(0, uzunluk) || undefined;

  await salonKaydet({
    ...salon,
    ingilizce: veri.get("ingilizce") === "evet",
    sloganEn: kes("sloganEn", 120),
    hakkindaBaslikEn: kes("hakkindaBaslikEn", 80),
    hakkindaEn: kes("hakkindaEn", 800),
  });

  tazele();
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/randevu`);
  return "tamam";
}

/** Ayarın gerçekten çalıştığını görmek için tek tuşluk deneme. */
export async function denemePostasiEylem(
  _onceki: string | null,
  _veri: FormData
): Promise<string | null> {
  const slug = await slugAl();
  const salon = await salonGetir(slug);
  if (!salon) return "Salon bulunamadı.";
  if (!salon.eposta) return "Önce bir e-posta adresi yazıp kaydedin.";
  if (!epostaKuruluMu())
    return "E-posta gönderimi bu kurulumda açık değil (RESEND_API_KEY tanımlı değil).";

  const m = denemePostasi(salon.ad, `${siteKoku()}/panel/bugun`);
  const sonuc = await epostaGonder({ kime: salon.eposta, ...m });
  return sonuc.tamam ? "tamam" : sonuc.sebep;
}

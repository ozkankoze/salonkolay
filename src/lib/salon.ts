/**
 * SALONKOLAY — veri modeli
 *
 * Her salon tek bir kayıttır. Sistem çok kiracılıdır: tek kod tabanı,
 * salon sayısı kadar kayıt. Yeni salon = yeni kayıt, yeni proje değil.
 *
 * Şu an veriler kodun içindeki `salonlar` dizisinden geliyor.
 * Veritabanı bağlandığında `salonBul` fonksiyonunun içi değişecek,
 * sayfaların hiçbiri değişmeyecek.
 */

export type Hizmet = {
  id: string;
  ad: string;
  /** Takvim bu süreye göre yerleştirir — ZORUNLU. */
  dakika: number;
  /** İsteğe bağlı. Boşsa sayfada "Salonda belirlenir" yazar. */
  fiyat?: number;
  aciklama?: string;
  /** Fiyat listesinde gruplama başlığı. */
  grup?: string;
};

export type Personel = {
  id: string;
  ad: string;
  unvan?: string;
  /** Kare görsel. Boşsa baş harf gösterilir. */
  foto?: string;
  /** Boşsa bütün hizmetleri yapabilir. */
  hizmetler?: string[];
};

/** 0 = Pazar … 6 = Cumartesi */
export type Calisma = {
  gun: number;
  acilis: string; // "09:00"
  kapanis: string; // "19:00"
  kapali?: boolean;
};

export type Yorum = { ad: string; puan: number; metin: string; tarih?: string };

export type Salon = {
  slug: string;
  ad: string;
  slogan?: string;
  /** Üst başlıkta markanın kendi yazımı (logo yoksa kullanılır). */
  kisaAd?: string;
  logo?: string;
  hakkinda?: string;
  hakkindaBaslik?: string;
  telefon: string; // 905xxxxxxxxx
  instagram?: string;
  /** Randevu bildirimlerinin gideceği adres. */
  eposta?: string;
  /** Bildirim e-postası gönderilsin mi (varsayılan: adres varsa evet). */
  bildirim?: boolean;
  adres?: string;
  haritaUrl?: string;
  haritaGomme?: string;

  /** Tema — her salon kendi rengini taşır. */
  renk: string; // vurgu / altın
  koyu: string; // koyu metin ve düğme
  zemin: string; // sayfa arka planı
  acikZemin: string; // kart arka planı

  kapak?: string;
  galeri?: string[];
  yorumlar?: Yorum[];
  rakamlar?: { sayi: string; etiket: string }[];

  hizmetler: Hizmet[];
  personel: Personel[];
  calisma: Calisma[];
  /** Randevu ızgarasının adımı (dakika). */
  aralikDk: number;
  /** Bugünden itibaren kaç gün ileriye randevu alınabilir. */
  ufukGun: number;
  /** Demo sayfası mı — altta uyarı gösterilir. */
  demo?: boolean;
};

export const GUN_ADI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export const salonlar: Salon[] = [
  {
    slug: "pinar",
    ad: "Pınar Kuaför",
    kisaAd: "Pınar",
    slogan: "Kuaför & Güzellik · Kadıköy, İstanbul",
    logo: "/logo/pinar-pembe.png",
    hakkindaBaslik: "On yıldır aynı sokakta",
    hakkinda:
      "Pınar Kuaför 2015'ten beri Kadıköy'de. Kesim, renk ve bakım üzerine çalışıyoruz; herkese aynı şeyi değil, saçınıza uyanı öneriyoruz. İlk gelişinizde ne istediğinizi konuşmadan makası elimize almıyoruz.",
    telefon: "905370108611",
    instagram: "pinarkuafor",
    adres: "Caferağa Mah. Moda Cad. No:12/A, Kadıköy / İstanbul",
    haritaUrl: "https://maps.google.com/?q=Moda+Caddesi+Kad%C4%B1k%C3%B6y",

    renk: "#B84A6E",
    koyu: "#46202F",
    zemin: "#FDF6F8",
    acikZemin: "#FFFFFF",

    kapak: "/salon/k1.jpg",
    galeri: ["/salon/s1.jpg", "/salon/k2.jpg", "/salon/s2.jpg", "/salon/k3.jpg", "/salon/s3.jpg"],
    rakamlar: [
      { sayi: "10+", etiket: "yıllık deneyim" },
      { sayi: "4.000+", etiket: "misafir" },
      { sayi: "4,9", etiket: "Google puanı" },
    ],
    yorumlar: [
      {
        ad: "Elif T.",
        puan: 5,
        metin:
          "Uzun süredir saçımı kimseye emanet edemiyordum. Pınar Hanım önce ne istediğimi dinledi, sonra kendi önerisini söyledi. Çıkan sonuç beklediğimden iyiydi.",
        tarih: "2 hafta önce",
      },
      {
        ad: "Merve K.",
        puan: 5,
        metin:
          "Balyaj için gittim, dört saat sürdü ama hiç sıkılmadım. Ekip çok ilgili, çay kahve eksik olmadı. Rengi tam istediğim gibi tutturdular.",
        tarih: "1 ay önce",
      },
      {
        ad: "Seda A.",
        puan: 5,
        metin:
          "Randevu sayfasından saat seçip gittim, beklemeden içeri aldılar. Daha önce telefonla uğraşıyordum, böylesi çok daha rahat.",
        tarih: "1 ay önce",
      },
    ],

    hizmetler: [
      { id: "h1", ad: "Kadın saç kesimi", dakika: 45, fiyat: 850, grup: "Saç" },
      { id: "h2", ad: "Fön", dakika: 30, fiyat: 450, grup: "Saç" },
      { id: "h3", ad: "Saç boyası", dakika: 120, aciklama: "Saç boyuna göre değişir", grup: "Renk" },
      { id: "h4", ad: "Ombre / Balyaj", dakika: 180, aciklama: "Ön görüşme ile", grup: "Renk" },
      { id: "h5", ad: "Keratin bakım", dakika: 90, fiyat: 3500, grup: "Bakım" },
      { id: "h8", ad: "Saç bakım maskesi", dakika: 40, fiyat: 950, grup: "Bakım" },
      { id: "h6", ad: "Manikür", dakika: 45, fiyat: 600, grup: "Tırnak & bakım" },
      { id: "h7", ad: "Kaş alımı", dakika: 15, fiyat: 250, grup: "Tırnak & bakım" },
    ],
    personel: [
      { id: "p1", ad: "Pınar", unvan: "Kurucu · Renk uzmanı", foto: "/ekip/p1.jpg" },
      { id: "p2", ad: "Melis", unvan: "Saç tasarım", foto: "/ekip/p2.jpg" },
      { id: "p3", ad: "Derya", unvan: "Tırnak & bakım", hizmetler: ["h6", "h7"], foto: "/ekip/p3.jpg" },
    ],
    calisma: [
      { gun: 0, acilis: "00:00", kapanis: "00:00", kapali: true },
      { gun: 1, acilis: "09:30", kapanis: "19:00" },
      { gun: 2, acilis: "09:30", kapanis: "19:00" },
      { gun: 3, acilis: "09:30", kapanis: "19:00" },
      { gun: 4, acilis: "09:30", kapanis: "20:00" },
      { gun: 5, acilis: "09:30", kapanis: "20:00" },
      { gun: 6, acilis: "10:00", kapanis: "18:00" },
    ],
    aralikDk: 15,
    ufukGun: 14,
    demo: true,
  },
];

/** Koddaki tohum kaydı. Canlı veri için `salonVeri.ts` kullanılır. */
export function salonBul(slug: string): Salon | undefined {
  return salonlar.find((s) => s.slug === slug.toLowerCase());
}

export function tumSalonlar(): Salon[] {
  return salonlar;
}

/** 850 -> "850 ₺" ; tanımsız -> null */
export function fiyatYaz(f?: number): string | null {
  if (typeof f !== "number") return null;
  return f.toLocaleString("tr-TR") + " ₺";
}

/** 45 -> "45 dk" ; 120 -> "2 sa" ; 90 -> "1 sa 30 dk" */
export function sureYaz(dk: number): string {
  if (dk < 60) return `${dk} dk`;
  const s = Math.floor(dk / 60);
  const k = dk % 60;
  return k ? `${s} sa ${k} dk` : `${s} sa`;
}

/** Hizmetleri grup başlıklarına ayırır. */
export function hizmetGruplari(s: Salon): { grup: string; hizmetler: Hizmet[] }[] {
  const harita = new Map<string, Hizmet[]>();
  for (const h of s.hizmetler) {
    const g = h.grup ?? "Hizmetler";
    if (!harita.has(g)) harita.set(g, []);
    harita.get(g)!.push(h);
  }
  return [...harita.entries()].map(([grup, hizmetler]) => ({ grup, hizmetler }));
}

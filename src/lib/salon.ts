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
  /** İngilizce karşılığı — boşsa Türkçesi gösterilir. */
  adEn?: string;
  /** Takvim bu süreye göre yerleştirir — ZORUNLU. */
  dakika: number;
  /** İsteğe bağlı. Boşsa sayfada "Salonda belirlenir" yazar. */
  fiyat?: number;
  aciklama?: string;
  aciklamaEn?: string;
  /** Fiyat listesinde gruplama başlığı. */
  grup?: string;
  grupEn?: string;
};

export type Personel = {
  id: string;
  ad: string;
  unvan?: string;
  unvanEn?: string;
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

/**
 * Galeri fotoğrafı.
 *
 * Eski kayıtlarda galeri düz bir adres dizisiydi; veritabanında öyle
 * duran salonlar var. O yüzden iki biçim de kabul ediliyor, okuyan
 * taraf `galeriOgeleri()` ile tek biçime çeviriyor.
 */
export type GaleriOgesi = {
  url: string;
  /** Varsa kart "öncesi / sonrası" olarak gösterilir. */
  oncesi?: string;
  /** Filtre için hizmet grubu — hizmetlerdeki `grup` ile aynı yazılır. */
  grup?: string;
  grupEn?: string;
  baslik?: string;
  baslikEn?: string;
};

export type Yorum = {
  ad: string;
  puan: number;
  metin: string;
  metinEn?: string;
  tarih?: string;
  tarihEn?: string;
};

export type Salon = {
  slug: string;
  ad: string;
  slogan?: string;
  sloganEn?: string;
  /** Üst başlıkta markanın kendi yazımı (logo yoksa kullanılır). */
  kisaAd?: string;
  logo?: string;
  hakkinda?: string;
  hakkindaEn?: string;
  hakkindaBaslik?: string;
  hakkindaBaslikEn?: string;
  telefon: string; // 905xxxxxxxxx
  instagram?: string;
  /** Randevu bildirimlerinin gideceği adres. */
  eposta?: string;
  /** Bildirim e-postası gönderilsin mi (varsayılan: adres varsa evet). */
  bildirim?: boolean;
  adres?: string;
  haritaUrl?: string;
  haritaGomme?: string;

  /**
   * Seçili hazır tema (bkz. `tema.ts`). Renkler aşağıya yazıldığı için
   * sayfalar bunu okumaz; panelde hangi kartın işaretli olduğunu
   * bilmek ve "kendi rengim" durumunu ayırt etmek için tutuluyor.
   */
  tema?: string;

  /** Tema — her salon kendi rengini taşır. */
  renk: string; // vurgu / altın
  koyu: string; // koyu metin ve düğme
  zemin: string; // sayfa arka planı
  acikZemin: string; // kart arka planı

  kapak?: string;
  galeri?: (string | GaleriOgesi)[];
  yorumlar?: Yorum[];
  rakamlar?: { sayi: string; etiket: string; etiketEn?: string }[];

  hizmetler: Hizmet[];
  personel: Personel[];
  calisma: Calisma[];
  /** Randevu ızgarasının adımı (dakika). */
  aralikDk: number;
  /** Bugünden itibaren kaç gün ileriye randevu alınabilir. */
  ufukGun: number;
  /** Demo sayfası mı — altta uyarı gösterilir. */
  demo?: boolean;
  /**
   * İngilizce dil eklentisi açık mı.
   * Kapalıysa müşteri tarafında dil düğmesi hiç görünmez.
   */
  ingilizce?: boolean;
};

export const GUN_ADI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export const salonlar: Salon[] = [
  {
    slug: "pinar",
    ad: "Pınar Kuaför",
    kisaAd: "Pınar",
    slogan: "Kuaför & Güzellik · Kadıköy, İstanbul",
    sloganEn: "Hair & Beauty · Kadıköy, İstanbul",
    logo: "/logo/pinar-pembe.png",
    hakkindaBaslik: "On yıldır aynı sokakta",
    hakkindaBaslikEn: "Ten years on the same street",
    hakkinda:
      "Pınar Kuaför 2015'ten beri Kadıköy'de. Kesim, renk ve bakım üzerine çalışıyoruz; herkese aynı şeyi değil, saçınıza uyanı öneriyoruz. İlk gelişinizde ne istediğinizi konuşmadan makası elimize almıyoruz.",
    hakkindaEn:
      "Pınar Kuaför has been in Kadıköy since 2015. We work with cuts, colour and care \u2014 not the same look for everyone, but the one that suits your hair. On your first visit we talk it through before we pick up the scissors.",
    telefon: "905370108611",
    instagram: "pinarkuafor",
    adres: "Caferağa Mah. Moda Cad. No:12/A, Kadıköy / İstanbul",
    haritaUrl: "https://maps.google.com/?q=Moda+Caddesi+Kad%C4%B1k%C3%B6y",

    renk: "#B84A6E",
    koyu: "#46202F",
    zemin: "#FDF6F8",
    acikZemin: "#FFFFFF",

    kapak: "/salon/k1.jpg",
    galeri: [
      { url: "/salon/s1.jpg", grup: "Saç", grupEn: "Hair", baslik: "Kesim sonrası", baslikEn: "After the cut" },
      {
        url: "/salon/k2.jpg",
        oncesi: "/salon/s2.jpg",
        grup: "Renk",
        grupEn: "Colour",
        baslik: "Balyaj çalışması",
        baslikEn: "Balayage work",
      },
      { url: "/salon/s2.jpg", grup: "Renk", grupEn: "Colour" },
      { url: "/salon/k3.jpg", grup: "Bakım", grupEn: "Care", baslik: "Keratin bakımı", baslikEn: "Keratin treatment" },
      { url: "/salon/s3.jpg", grup: "Saç", grupEn: "Hair" },
    ],
    rakamlar: [
      { sayi: "10+", etiket: "yıllık deneyim", etiketEn: "years of experience" },
      { sayi: "4.000+", etiket: "misafir", etiketEn: "guests" },
      { sayi: "4,9", etiket: "Google puanı", etiketEn: "Google rating" },
    ],
    yorumlar: [
      {
        ad: "Elif T.",
        puan: 5,
        metin:
          "Uzun süredir saçımı kimseye emanet edemiyordum. Pınar Hanım önce ne istediğimi dinledi, sonra kendi önerisini söyledi. Çıkan sonuç beklediğimden iyiydi.",
        metinEn:
          "For a long time I could not trust my hair to anyone. Pınar listened to what I wanted first, then gave her own suggestion. The result was better than I expected.",
        tarih: "2 hafta önce",
        tarihEn: "2 weeks ago",
      },
      {
        ad: "Merve K.",
        puan: 5,
        metin:
          "Balyaj için gittim, dört saat sürdü ama hiç sıkılmadım. Ekip çok ilgili, çay kahve eksik olmadı. Rengi tam istediğim gibi tutturdular.",
        metinEn:
          "I went in for balayage; it took four hours and I was never bored. The team is attentive and the tea never ran out. They matched the colour exactly as I wanted.",
        tarih: "1 ay önce",
        tarihEn: "1 month ago",
      },
      {
        ad: "Seda A.",
        puan: 5,
        metin:
          "Randevu sayfasından saat seçip gittim, beklemeden içeri aldılar. Daha önce telefonla uğraşıyordum, böylesi çok daha rahat.",
        metinEn:
          "I picked a time on the booking page and walked straight in with no waiting. I used to deal with phone calls; this is far easier.",
        tarih: "1 ay önce",
        tarihEn: "1 month ago",
      },
    ],

    hizmetler: [
      { id: "h1", ad: "Kadın saç kesimi", adEn: "Women's haircut", dakika: 45, fiyat: 850, grup: "Saç", grupEn: "Hair" },
      { id: "h2", ad: "Fön", adEn: "Blow-dry", dakika: 30, fiyat: 450, grup: "Saç", grupEn: "Hair" },
      {
        id: "h3",
        ad: "Saç boyası",
        adEn: "Hair colour",
        dakika: 120,
        aciklama: "Saç boyuna göre değişir",
        aciklamaEn: "Depends on hair length",
        grup: "Renk",
        grupEn: "Colour",
      },
      {
        id: "h4",
        ad: "Ombre / Balyaj",
        adEn: "Ombré / Balayage",
        dakika: 180,
        aciklama: "Ön görüşme ile",
        aciklamaEn: "After a consultation",
        grup: "Renk",
        grupEn: "Colour",
      },
      { id: "h5", ad: "Keratin bakım", adEn: "Keratin treatment", dakika: 90, fiyat: 3500, grup: "Bakım", grupEn: "Care" },
      { id: "h8", ad: "Saç bakım maskesi", adEn: "Hair mask", dakika: 40, fiyat: 950, grup: "Bakım", grupEn: "Care" },
      { id: "h6", ad: "Manikür", adEn: "Manicure", dakika: 45, fiyat: 600, grup: "Tırnak & bakım", grupEn: "Nails & beauty" },
      { id: "h7", ad: "Kaş alımı", adEn: "Eyebrow shaping", dakika: 15, fiyat: 250, grup: "Tırnak & bakım", grupEn: "Nails & beauty" },
    ],
    personel: [
      {
        id: "p1",
        ad: "Pınar",
        unvan: "Kurucu · Renk uzmanı",
        unvanEn: "Founder · Colour specialist",
        foto: "/ekip/p1.jpg",
      },
      { id: "p2", ad: "Melis", unvan: "Saç tasarım", unvanEn: "Hair stylist", foto: "/ekip/p2.jpg" },
      {
        id: "p3",
        ad: "Derya",
        unvan: "Tırnak & bakım",
        unvanEn: "Nails & beauty",
        hizmetler: ["h6", "h7"],
        foto: "/ekip/p3.jpg",
      },
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
    ingilizce: true,
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

/**
 * Hizmetleri grup başlıklarına ayırır.
 *
 * Gruplama her zaman Türkçe başlığa göre yapılır — İngilizce karşılık
 * girilmemiş bir hizmet grubu ikiye bölünmesin. Gösterilecek başlık
 * `baslik` alanında döner.
 */
export function hizmetGruplari(
  s: Salon,
  ingilizceMi = false
): { grup: string; baslik: string; hizmetler: Hizmet[] }[] {
  const harita = new Map<string, Hizmet[]>();
  for (const h of s.hizmetler) {
    const g = h.grup ?? (ingilizceMi ? "Services" : "Hizmetler");
    if (!harita.has(g)) harita.set(g, []);
    harita.get(g)!.push(h);
  }
  return [...harita.entries()].map(([grup, hizmetler]) => ({
    grup,
    // Grubun İngilizce adını, o gruptaki ilk dolu `grupEn` belirler.
    baslik: ingilizceMi ? (hizmetler.find((h) => h.grupEn?.trim())?.grupEn ?? grup) : grup,
    hizmetler,
  }));
}


/** Galeriyi tek biçime indirger (eski düz adres dizisi de çalışsın diye). */
export function galeriOgeleri(s: Salon): GaleriOgesi[] {
  return (s.galeri ?? []).map((g) => (typeof g === "string" ? { url: g } : g));
}

/** Galeride kullanılan grup başlıkları — filtre şeridi bunlardan kurulur. */
export function galeriGruplari(s: Salon): string[] {
  const gorulen: string[] = [];
  for (const o of galeriOgeleri(s)) {
    const g = o.grup?.trim();
    if (g && !gorulen.includes(g)) gorulen.push(g);
  }
  return gorulen;
}

/** Bir grubun İngilizce karşılığı (ilk dolu `grupEn` kazanır). */
export function galeriGrupEn(s: Salon, grup: string): string | undefined {
  return galeriOgeleri(s).find((o) => o.grup === grup && o.grupEn?.trim())?.grupEn;
}

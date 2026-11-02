/**
 * DİL EKLENTİSİ
 *
 * İngilizce, sisteme sonradan takılan bir eklenti gibi duruyor: rotalar
 * değişmedi, sayfalar aynı. Her sayfa `sozluk(dil)` çağırıp metinlerini
 * oradan alıyor.
 *
 * Dil nasıl seçiliyor:
 *   1. Adresteki `?dil=en` (bağlantı paylaşıldığında da çalışsın diye)
 *   2. Çerez (ziyaretçinin bir önceki tercihi)
 *   3. Varsayılan: Türkçe
 *
 * Salon panelden "İngilizce" desteğini açmadıysa müşteri tarafında dil
 * düğmesi hiç görünmez ve sayfa Türkçe kalır.
 */

export type Dil = "tr" | "en";

export const DIL_CEREZI = "sk_dil";

export function dilAyikla(deger: unknown): Dil | null {
  return deger === "en" || deger === "tr" ? deger : null;
}

/** Sayfalara gelen `?dil=` ve çerezden dili çözer. */
export function dilSec(aramaDili: unknown, cerezDili: unknown, destekliMi = true): Dil {
  if (!destekliMi) return "tr";
  return dilAyikla(aramaDili) ?? dilAyikla(cerezDili) ?? "tr";
}

/** Mevcut adrese dil parametresini ekler. */
export function dilliAdres(adres: string, dil: Dil): string {
  if (dil === "tr") return adres;
  return adres + (adres.includes("?") ? "&" : "?") + "dil=en";
}

/* ─────────────────────────── sözlük ─────────────────────────── */

export type Sozluk = typeof TR;

const TR = {
  // genel
  dilAdi: "Türkçe",
  digerDil: "English",
  randevuAl: "Randevu al",
  ara: "Ara",
  whatsapp: "WhatsApp",
  geri: "Geri",
  salonaDon: "Salon sayfasına dön",
  randevuyaDon: "Randevu sayfasına dön",
  devam: "Devam",
  kapat: "Kapat",
  vazgec: "Vazgeç",
  kaydet: "Kaydet",
  siteyiGor: "Siteyi gör",
  yolTarifi: "Yol tarifi",

  // salonkolay'ın kendi sayfası
  skBaslikUst: "Randevular artık",
  skBaslikAlt: "DM’de değil.",
  skAciklama:
    "Salonunuzun kendi randevu sayfası. Müşteriniz saatini kendi seçer, randevu size düşer.",
  skOrnekler: "Örnek sayfalar",
  skPanel: "Salon paneli",
  skTitle: "Salonkolay — salonunuz için randevu sayfası",
  skDescription:
    "Müşteriniz saatini kendi seçsin, randevu size düşsün. Instagram bio'nuza koyacağınız randevu sayfası.",

  // güven bölümü
  uzerineBilgi: "Salon hakkında",
  adresEtiket: "Adres",
  telefonEtiket: "Telefon",
  bugunSaatleri: "Bugün",
  yorumYok: "Henüz yorum yok.",
  puanNereden: "Puan, buradaki müşteri yorumlarının ortalamasıdır.",

  // galeri
  hepsi: "Hepsi",
  oncesi: "Öncesi",
  sonrasi: "Sonrası",
  oncesiSonrasi: "Öncesi / Sonrası",
  buGruptaFotoYok: "Bu başlıkta henüz fotoğraf yok.",

  // ekip
  ileRandevuAl: "{ad} ile randevu al",
  yaptigiIsler: "Yaptığı işler",
  tumHizmetler: "Tüm hizmetler",

  // ilk ekran durumu
  suAnAcik: "Şu an açık",
  suAnKapali: "Şu an kapalı",
  kapanisaKadar: "{saat}'e kadar",
  acilisBilgisi: "{gun} {saat}'te açılıyor",
  yorumAdet: "yorum",
  puanEtiketi: "müşteri puanı",

  // hizmet seçimi
  hizmetSec: "Seç",
  hizmetSecildi: "Seçildi",
  secimTemizle: "Seçimi temizle",
  birHizmetSecildi: "1 hizmet seçildi",
  cokHizmetSecildi: "{n} hizmet seçildi",
  secerekDevam: "Seçtiklerinle devam et",
  hizmetSecmeIpucu: "Hizmetleri buradan seçip doğrudan saat seçmeye geçebilirsiniz.",

  // salon sitesi
  menuHizmetler: "Hizmetler",
  menuEkip: "Ekip",
  menuGaleri: "Galeri",
  menuIletisim: "İletişim",
  heroUst: "Saçınıza",
  heroAlt: "uyanı yapıyoruz.",
  heroAciklama: "Kesim, renk ve bakım.",
  hakkimizda: "Hakkımızda",
  fiyatListesi: "Fiyat listesi",
  hizmetler: "Hizmetler",
  salondaBelirlenir: "Salonda belirlenir",
  saatSecRandevuAl: "Saat seç, randevu al",
  tanisalim: "Tanışalım",
  ekibimiz: "Ekibimiz",
  salondan: "Salondan",
  galeri: "Galeri",
  misafirlerimiz: "Misafirlerimiz",
  neDiyorlar: "Ne diyorlar?",
  calismaSaatleri: "Çalışma saatleri",
  iletisim: "İletişim",
  kapali: "Kapalı",
  bugun: "bugün",
  saatiniziAyirin: "Saatinizi şimdi ayırın.",
  saatiniziAciklama: "Hangi gün, kaçta ve kimden — üç adımda seçin. Telefonla uğraşmayın.",
  salonkolayIle: "Salonkolay ile hazırlandı",

  // randevu akışı
  onlineRandevu: "Online randevu",
  uygunSaatiSecin: "Size uygun saati seçin",
  randevuGiris:
    "Hizmetinizi ve saatinizi seçin, adınızı yazın — randevunuz anında oluşur. Telefonla uğraşmanıza gerek yok.",
  neYaptiracaksiniz: "Ne yaptıracaksınız?",
  birdenFazla: "Birden fazla seçebilirsiniz.",
  kimdenAlalim: "Kimden alalım?",
  farketmez: "Farketmez",
  farketmezAciklama: "Uygun olan ilk kişi",
  neZaman: "Ne zaman?",
  onceGunSecin: "Önce bir gün seçin.",
  oGunMusaitDegil: "Bu gün için uygun saat kalmamış.",
  sonAdim: "Son adım",
  saatlerGetiriliyor: "Saatler getiriliyor…",
  baskaGunSecin: "Başka bir gün seçebilir ya da salonu arayabilirsiniz.",
  kiminle: "Kimden",
  adiniz: "Adınız",
  telefon: "Telefon",
  notIsteğeBagli: "Not (isteğe bağlı)",
  randevuyuTamamla: "Randevuyu tamamla",
  gonderiliyor: "Gönderiliyor…",
  numaraniz: "Numaranız yalnızca bu randevu için salona iletilir.",
  randevunuzAlindi: "Randevunuz alındı",
  salonOnaylayinca: "Salon onayladığında size haber verilecek.",
  baglantiyiSaklayin: "Randevunuzu görüntülemek veya",
  iptalEtmek: "iptal etmek",
  icinBaglanti: "için bu bağlantıyı saklayın:",
  randevumuGoruntule: "Randevumu görüntüle",
  baglantiyiKopyala: "Bağlantıyı kopyala",
  baglantiKopyalandi: "Bağlantı kopyalandı",
  whatsapptanYaz: "WhatsApp'tan yaz",

  // randevu detay / iptal
  randevunuz: "Randevunuz",
  iptalEdildi: "İptal edildi",
  ad: "Ad",
  hizmet: "Hizmet",
  kimBakacak: "Kim bakacak",
  sure: "Süre",
  tutar: "Tutar",
  notunuz: "Notunuz",
  randevuyuIptalEt: "Randevuyu iptal et",
  saatiDegistir: "Saati değiştir",
  sorunVarsaArayin: "Bir sorun olursa salonu arayabilirsiniz.",
  yeniSaatSecin: "Yeni gün ve saat seçin",
  yeniSaat: "Yeni saat",
  saatDegisti: "Randevunuzun saati değişti.",
  saatDegistiAciklama: "Salona bildirildi. Yeni saatinizi aşağıda görebilirsiniz.",
  kaydediliyor: "Kaydediliyor…",
  ayniRandevuyuTekrarAl: "Aynı randevuyu tekrar al",
  takvimeEkle: "Takvime ekle",
  takvimeEkleAciklama: "Telefonunuz randevudan önce hatırlatsın.",
  eminMisiniz: "Randevunuzu iptal etmek istediğinize emin misiniz?",
  evetIptalEt: "Evet, iptal et",
  iptalEdiliyor: "İptal ediliyor…",
  randevunuzIptalEdildi: "Randevunuz iptal edildi.",
  salonaBildirildi: "Salona bildirildi. Yeniden randevu almak isterseniz aşağıdan devam edebilirsiniz.",
  yeniRandevuAl: "Yeni randevu al",
  salonuAra: "Salonu ara",
  saatiDegistirmek:
    "Saati değiştirmek isterseniz önce iptal edip yeniden randevu alabilir ya da salonu arayabilirsiniz.",
  baglantiGecersiz: "Bağlantı geçersiz",
  baglantiGecersizAciklama:
    "Bu bağlantı eksik veya hatalı görünüyor. Randevunuzla ilgili bir sorun varsa salonu arayabilirsiniz.",
  saatOn: "saat",
  waRandevuMesaji: "Merhaba, {gun} {saat} randevum hakkında yazıyorum. ({ad})",
  waAldimMesaji: "Merhaba, {gun} {saat} için randevu aldım. ({ad})",

  // sayfa başlıkları (sekme ve arama sonucu)
  basRandevu: "Randevu",
  basRandevuAl: "Randevu al",
  basRandevuAciklama: "için uygun saati seçin, randevunuzu saniyeler içinde oluşturun.",
  basKvkkAciklama: "randevu sayfasında işlenen kişisel veriler hakkında aydınlatma metni.",
  basRandevunuz: "Randevunuz",

  // KVKK
  kvkkEtiket: "KVKK",
  kvkkBaslik: "Kişisel verilerin korunması",
  kvkkGiris:
    "Randevu alırken paylaştığınız bilgilerin ne olduğunu, neden alındığını ve ne kadar saklandığını burada açıkça yazdık.",
  kvkkOnay: "Randevu için adımın ve telefon numaramın işlenmesine ilişkin aydınlatma metnini okudum.",
  aydinlatmaMetni: "Aydınlatma metni",
  randevuSayfasinaDon: "Randevu sayfasına dön",

  // hatalar
  adiniziYazin: "Adınızı yazar mısınız?",
  telefonEksik: "Telefon numarası eksik görünüyor.",
  onaylayin: "Devam etmek için aydınlatma metnini onaylayın.",
  baglantiKurulamadi: "Bağlantı kurulamadı. Tekrar dener misiniz?",
  saatDoldu: "Bu saat az önce doldu. Başka bir saat seçer misiniz?",
  randevuBulunamadi: "Randevu bulunamadı.",
  saatiGecmis: "Bu randevunun saati geçmiş. Salonu arayın.",

  // demo
  demoBaslik: "Bu bir demo sayfadır.",
  demoAciklama:
    "Salon adı, adres, telefon, fiyatlar, ekip üyeleri, yorumlar ve fotoğraflar örnek amaçlı hazırlanmıştır; gerçek bir işletmeye veya gerçek kişilere ait değildir.",
  demoRandevu: "Buradan oluşturulan randevular hiçbir yere iletilmez.",
  demoRandevuDegil: "Gerçek bir randevu değildir.",

  // gün adları
  gunler: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  gunlerKisa: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  aylar: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
  aylarKisa: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
  dk: "dk",
  sa: "sa",

  /* ── Salonkolay'ın kendi sayfaları: üst bar, ana sayfa, keşfet, başvuru ── */
  pKesfet: "Salonları Keşfet",
  pKategoriler: "Kategoriler",
  pNasil: "Nasıl Çalışır?",
  pSalonEkle: "Salonunu Ekle",
  pGiris: "Giriş Yap",
  pMenu: "Menü",
  pKapat: "Kapat",

  pHeroUst: "Güzelliğe zaman ayır.",
  pHeroAlt: "Gerisini bize bırak.",
  pHeroAciklama:
    "En iyi salonları keşfet, sana uygun hizmeti seç ve randevunu saniyeler içinde oluştur.",
  pAramaHizmet: "Salon veya hizmet ara",
  pAramaHizmetYer: "Saç kesimi, balyaj…",
  pAramaKonum: "Konum",
  pAramaKonumHepsi: "Tüm konumlar",
  pAramaDugme: "Keşfet",

  pKatBaslik: "Bugün kendine ne iyi gelir?",
  pKatAciklama: "Aradığın hizmeti seç, o kategorideki salonları gör.",
  pKatYakinda: "Yakında",
  pKatSalonSayisi: "salon",

  pSalonBaslik: "Keşfetmeye değer salonlar",
  pSalonAciklama: "Salonkolay'da sayfası olan işletmeler.",
  pSalonHepsi: "Hepsini gör",
  pSalonDemo: "Demo sayfa",
  pSalonDemoNot:
    "Pınar Kuaför, sistemin nasıl göründüğünü anlatmak için hazırlanmış örnek bir sayfadır.",
  pSalonIncele: "Salonu incele",
  pSalonBugun: "Bugün açık",
  pSalonKapali: "Bugün kapalı",

  pNasilBaslik: "Randevu almak hiç bu kadar kolay olmamıştı.",
  pNasil1: "Salonunu keşfet.",
  pNasil1Alt: "Konumuna ve aradığın hizmete göre ara, salonun sayfasını aç.",
  pNasil2: "Hizmetini ve saatini seç.",
  pNasil2Alt: "Fiyatı ve süreyi gör, istersen uzmanını seç, boş saatlere bak.",
  pNasil3: "Randevunu oluştur.",
  pNasil3Alt: "Adın ve telefonun yeter. Onay ekranından takvimine ekle.",

  pVitrinUst: "Sevdiğin salon,",
  pVitrinAlt: "tek dokunuş uzağında.",
  pVitrinAciklama:
    "Hizmetleri incele, fiyatları karşılaştır, uzmanını seç ve sana uygun zamanda randevunu oluştur.",
  pVitrinDugme: "Örnek salon sayfasını aç",

  pSahipUst: "Salonunuzu",
  pSahipAlt: "geleceğe taşıyın.",
  pSahipAciklama:
    "Size özel salon sayfası, kolay randevu yönetimi ve müşterilerinizle daha güçlü bir bağ. Hepsi Salonkolay'da.",
  pSahip1: "Kendi adresiniz",
  pSahip1Alt: "salonkolay.com/salonunuz — Instagram bio'nuza koyacağınız tek bağlantı.",
  pSahip2: "Randevu paneli",
  pSahip2Alt: "Günlük program, takvim, kasa ve müsait saatler tek ekranda.",
  pSahip3: "Kurulum bizde",
  pSahip3Alt: "Hizmetleriniz, saatleriniz ve fotoğraflarınız yerleştirilmiş halde teslim.",

  pAltAciklama:
    "Salonkolay, güzellik ve bakım salonları için randevu sayfası ve yönetim paneli.",
  pAltKategoriler: "Kategoriler",
  pAltKurumsal: "Salonkolay",
  pAltIletisim: "İletişim",
  pAltHaklar: "Tüm hakları saklıdır.",

  kBaslik: "Salonları keşfet",
  kAciklama: "Hizmete, salon adına veya konuma göre ara.",
  kSonuc: "salon bulundu",
  kTumKategoriler: "Tümü",
  kFiltreTemizle: "Filtreyi temizle",
  kBosBaslik: "Bu aramaya uyan salon yok.",
  kBosAciklama:
    "Salonkolay yeni; her kategoride henüz salon yok. Aradığın salonun burada olmasını istersen bize söyle, biz davet edelim.",
  kBosDugme: "Salonunu ekle",

  sBaslik: "Salonunuzu Salonkolay'a ekleyin",
  sAciklama:
    "Formu bırakın, aynı gün dönüş yapalım. Sayfanızı biz kuruyoruz; hizmetleriniz, çalışma saatleriniz ve fotoğraflarınız yerleştirilmiş halde teslim ediyoruz.",
  sSalonAdi: "Salon adı",
  sSehir: "Şehir / ilçe",
  sTelefon: "Telefon",
  sInstagram: "Instagram (isteğe bağlı)",
  sEposta: "E-posta (isteğe bağlı)",
  sNot: "Eklemek istediğiniz bir şey var mı?",
  sGonder: "Başvuruyu gönder",
  sGonderiliyor: "Gönderiliyor…",
  sTamam: "Başvurunuz bize ulaştı. En kısa sürede arayacağız.",
  sHataAlan: "Lütfen salon adı, şehir ve telefon alanlarını doldurun.",
  sHataTelefon: "Telefon numarası geçerli görünmüyor.",
  sHataGonderim: "Başvuru şu an gönderilemedi. Telefonla ulaşabilirsiniz:",
  pKvkkBaslik: "Kişisel verilerin korunması",
  pKvkkAlt:
    "Salonkolay'ın kendi sitesinde topladığı veriler. Bir salondan randevu aldığınızda veri sorumlusu o salondur; onun metni kendi sayfasındadır.",
  pKvkkSalon: "Bir salonun kendi aydınlatma metni için salonun sayfasına bakın:",
  sKvkk:
    "Formu göndererek, sizinle bu başvuru hakkında iletişime geçmemiz için bilgilerinizin işlenmesine izin vermiş olursunuz.",
};

const EN: Sozluk = {
  dilAdi: "English",
  digerDil: "Türkçe",
  randevuAl: "Book now",
  ara: "Call",
  whatsapp: "WhatsApp",
  geri: "Back",
  salonaDon: "Back to the salon page",
  randevuyaDon: "Back to the booking page",
  devam: "Continue",
  kapat: "Close",
  vazgec: "Cancel",
  kaydet: "Save",
  siteyiGor: "View site",
  yolTarifi: "Directions",

  skBaslikUst: "Bookings don’t",
  skBaslikAlt: "live in your DMs.",
  skAciklama:
    "Your salon's own booking page. Your client picks their own time, and the booking lands with you.",
  skOrnekler: "Example pages",
  skPanel: "Salon panel",
  skTitle: "Salonkolay — a booking page for your salon",
  skDescription:
    "Let your clients pick their own time and have the booking land with you. A booking page for your Instagram bio.",

  uzerineBilgi: "About the salon",
  adresEtiket: "Address",
  telefonEtiket: "Phone",
  bugunSaatleri: "Today",
  yorumYok: "No reviews yet.",
  puanNereden: "The rating is the average of these guest reviews.",

  hepsi: "All",
  oncesi: "Before",
  sonrasi: "After",
  oncesiSonrasi: "Before / After",
  buGruptaFotoYok: "No photos under this heading yet.",

  ileRandevuAl: "Book with {ad}",
  yaptigiIsler: "Services",
  tumHizmetler: "All services",

  suAnAcik: "Open now",
  suAnKapali: "Closed now",
  kapanisaKadar: "until {saat}",
  acilisBilgisi: "opens {gun} at {saat}",
  yorumAdet: "reviews",
  puanEtiketi: "guest rating",

  hizmetSec: "Select",
  hizmetSecildi: "Selected",
  secimTemizle: "Clear selection",
  birHizmetSecildi: "1 service selected",
  cokHizmetSecildi: "{n} services selected",
  secerekDevam: "Continue with your selection",
  hizmetSecmeIpucu: "Pick your services here and go straight to choosing a time.",

  menuHizmetler: "Services",
  menuEkip: "Team",
  menuGaleri: "Gallery",
  menuIletisim: "Contact",
  heroUst: "A cut that suits",
  heroAlt: "you, not everyone.",
  heroAciklama: "Cuts, colour and care.",
  hakkimizda: "About us",
  fiyatListesi: "Price list",
  hizmetler: "Services",
  salondaBelirlenir: "Quoted in salon",
  saatSecRandevuAl: "Pick a time, book now",
  tanisalim: "Meet us",
  ekibimiz: "Our team",
  salondan: "From the salon",
  galeri: "Gallery",
  misafirlerimiz: "Our guests",
  neDiyorlar: "What they say",
  calismaSaatleri: "Opening hours",
  iletisim: "Contact",
  kapali: "Closed",
  bugun: "today",
  saatiniziAyirin: "Book your time now.",
  saatiniziAciklama: "Day, time and stylist — three steps. No phone calls needed.",
  salonkolayIle: "Made with Salonkolay",

  onlineRandevu: "Online booking",
  uygunSaatiSecin: "Pick a time that suits you",
  randevuGiris:
    "Choose your service and time, leave your name — your booking is created instantly. No phone call needed.",
  neYaptiracaksiniz: "What would you like?",
  birdenFazla: "You can pick more than one.",
  kimdenAlalim: "Who would you like?",
  farketmez: "No preference",
  farketmezAciklama: "First available",
  neZaman: "When?",
  onceGunSecin: "Pick a day first.",
  oGunMusaitDegil: "No times left for this day.",
  sonAdim: "Last step",
  saatlerGetiriliyor: "Loading times…",
  baskaGunSecin: "You can pick another day or call the salon.",
  kiminle: "With",
  adiniz: "Your name",
  telefon: "Phone",
  notIsteğeBagli: "Note (optional)",
  randevuyuTamamla: "Confirm booking",
  gonderiliyor: "Sending…",
  numaraniz: "Your number is shared with the salon for this booking only.",
  randevunuzAlindi: "Your booking is confirmed",
  salonOnaylayinca: "The salon will let you know once it is approved.",
  baglantiyiSaklayin: "Keep this link to view or",
  iptalEtmek: "cancel",
  icinBaglanti: "your booking:",
  randevumuGoruntule: "View my booking",
  baglantiyiKopyala: "Copy link",
  baglantiKopyalandi: "Link copied",
  whatsapptanYaz: "Message on WhatsApp",

  randevunuz: "Your booking",
  iptalEdildi: "Cancelled",
  ad: "Name",
  hizmet: "Service",
  kimBakacak: "Stylist",
  sure: "Duration",
  tutar: "Price",
  notunuz: "Your note",
  randevuyuIptalEt: "Cancel booking",
  saatiDegistir: "Change the time",
  sorunVarsaArayin: "If anything is wrong, you can call the salon.",
  yeniSaatSecin: "Pick a new day and time",
  yeniSaat: "New time",
  saatDegisti: "Your appointment has been moved.",
  saatDegistiAciklama: "The salon has been notified. Your new time is shown below.",
  kaydediliyor: "Saving…",
  ayniRandevuyuTekrarAl: "Book this again",
  takvimeEkle: "Add to calendar",
  takvimeEkleAciklama: "So your phone reminds you before the appointment.",
  eminMisiniz: "Are you sure you want to cancel your booking?",
  evetIptalEt: "Yes, cancel it",
  iptalEdiliyor: "Cancelling…",
  randevunuzIptalEdildi: "Your booking has been cancelled.",
  salonaBildirildi: "The salon has been notified. You can book again below.",
  yeniRandevuAl: "Book again",
  salonuAra: "Call the salon",
  saatiDegistirmek:
    "To change the time, cancel this booking and pick a new one, or call the salon.",
  baglantiGecersiz: "Invalid link",
  baglantiGecersizAciklama:
    "This link looks incomplete or incorrect. If something is wrong with your booking, please call the salon.",
  saatOn: "at",
  waRandevuMesaji: "Hello, I'm writing about my booking on {gun} at {saat}. ({ad})",
  waAldimMesaji: "Hello, I've booked for {gun} at {saat}. ({ad})",

  basRandevu: "Booking",
  basRandevuAl: "Book now",
  basRandevuAciklama: "— pick a time that suits you and book in seconds.",
  basKvkkAciklama: "— privacy notice for the data processed on this booking page.",
  basRandevunuz: "Your booking",

  kvkkEtiket: "Privacy",
  kvkkBaslik: "Protection of personal data",
  kvkkGiris:
    "Here is exactly what we collect when you book, why we collect it and how long we keep it.",
  kvkkOnay: "I have read the privacy notice about how my name and phone number are processed.",
  aydinlatmaMetni: "Privacy notice",
  randevuSayfasinaDon: "Back to booking",

  adiniziYazin: "Could you write your name?",
  telefonEksik: "That phone number looks incomplete.",
  onaylayin: "Please accept the privacy notice to continue.",
  baglantiKurulamadi: "Could not connect. Would you try again?",
  saatDoldu: "That time was just taken. Could you pick another?",
  randevuBulunamadi: "Booking not found.",
  saatiGecmis: "This appointment time has passed. Please call the salon.",

  demoBaslik: "This is a demo page.",
  demoAciklama:
    "The salon name, address, phone, prices, team members, reviews and photos are examples; they do not belong to a real business or real people.",
  demoRandevu: "Bookings made here are not sent anywhere.",
  demoRandevuDegil: "It is not a real appointment.",

  gunler: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  gunlerKisa: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  aylar: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  aylarKisa: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dk: "min",
  sa: "h",

  /* ── Salonkolay's own pages: header, home, discover, apply ── */
  pKesfet: "Discover salons",
  pKategoriler: "Categories",
  pNasil: "How it works",
  pSalonEkle: "List your salon",
  pGiris: "Log in",
  pMenu: "Menu",
  pKapat: "Close",

  pHeroUst: "Make time for yourself.",
  pHeroAlt: "We’ll handle the rest.",
  pHeroAciklama:
    "Discover the best salons, pick the service that suits you and book in seconds.",
  pAramaHizmet: "Search a salon or service",
  pAramaHizmetYer: "Haircut, balayage…",
  pAramaKonum: "Location",
  pAramaKonumHepsi: "All locations",
  pAramaDugme: "Discover",

  pKatBaslik: "What would feel good today?",
  pKatAciklama: "Pick what you are after and see the salons in that category.",
  pKatYakinda: "Soon",
  pKatSalonSayisi: "salons",

  pSalonBaslik: "Salons worth discovering",
  pSalonAciklama: "Businesses with a page on Salonkolay.",
  pSalonHepsi: "See all",
  pSalonDemo: "Demo page",
  pSalonDemoNot:
    "Pınar Kuaför is an example page, built to show how the system looks.",
  pSalonIncele: "View salon",
  pSalonBugun: "Open today",
  pSalonKapali: "Closed today",

  pNasilBaslik: "Booking has never been this easy.",
  pNasil1: "Find your salon.",
  pNasil1Alt: "Search by location or service and open the salon’s page.",
  pNasil2: "Pick the service and time.",
  pNasil2Alt: "See the price and duration, choose your stylist, check free slots.",
  pNasil3: "Book it.",
  pNasil3Alt: "Your name and phone are enough. Add it to your calendar on the confirmation screen.",

  pVitrinUst: "The salon you love,",
  pVitrinAlt: "one tap away.",
  pVitrinAciklama:
    "Browse the services, compare prices, choose your stylist and book a time that works for you.",
  pVitrinDugme: "Open the example salon page",

  pSahipUst: "Bring your salon",
  pSahipAlt: "into the future.",
  pSahipAciklama:
    "Your own salon page, easy booking management and a stronger bond with your guests. All on Salonkolay.",
  pSahip1: "Your own address",
  pSahip1Alt: "salonkolay.com/yoursalon — one link for your Instagram bio.",
  pSahip2: "Booking panel",
  pSahip2Alt: "Daily schedule, calendar, till and free slots on one screen.",
  pSahip3: "We set it up",
  pSahip3Alt: "Delivered with your services, hours and photos already in place.",

  pAltAciklama:
    "Salonkolay — booking pages and a management panel for beauty and grooming salons.",
  pAltKategoriler: "Categories",
  pAltKurumsal: "Salonkolay",
  pAltIletisim: "Contact",
  pAltHaklar: "All rights reserved.",

  kBaslik: "Discover salons",
  kAciklama: "Search by service, salon name or location.",
  kSonuc: "salons found",
  kTumKategoriler: "All",
  kFiltreTemizle: "Clear filters",
  kBosBaslik: "No salon matches this search.",
  kBosAciklama:
    "Salonkolay is new and not every category has a salon yet. If you want a salon listed here, tell us and we will invite them.",
  kBosDugme: "List your salon",

  sBaslik: "List your salon on Salonkolay",
  sAciklama:
    "Leave your details and we will get back to you the same day. We build the page for you — services, opening hours and photos already in place.",
  sSalonAdi: "Salon name",
  sSehir: "City / district",
  sTelefon: "Phone",
  sInstagram: "Instagram (optional)",
  sEposta: "Email (optional)",
  sNot: "Anything you would like to add?",
  sGonder: "Send application",
  sGonderiliyor: "Sending…",
  sTamam: "We have your application. We will call you shortly.",
  sHataAlan: "Please fill in the salon name, city and phone fields.",
  sHataTelefon: "That phone number does not look valid.",
  sHataGonderim: "The application could not be sent right now. You can reach us by phone:",
  pKvkkBaslik: "Protection of personal data",
  pKvkkAlt:
    "Data collected on Salonkolay's own site. When you book with a salon, that salon is the data controller and its own notice is on its page.",
  pKvkkSalon: "For a salon's own privacy notice, see that salon's page:",
  sKvkk:
    "By sending this form you allow us to process your details so we can contact you about this application.",
};

export function sozluk(dil: Dil): Sozluk {
  return dil === "en" ? EN : TR;
}

/* ───────────────── dile göre biçimler ───────────────── */

/** "Merhaba, {gun} ..." kalıbındaki yerleri doldurur. */
export function doldur(kalip: string, degerler: Record<string, string>): string {
  return kalip.replace(/\{(\w+)\}/g, (tam, ad) => degerler[ad] ?? tam);
}

/** "2026-10-31" -> "31 Ekim Cumartesi" / "Saturday 31 October" */
export function gunYazDil(gun: string, dil: Dil): string {
  const [y, a, g] = gun.split("-").map(Number);
  const d = new Date(y, a - 1, g);
  const s = sozluk(dil);
  return dil === "en"
    ? `${s.gunler[d.getDay()]} ${d.getDate()} ${s.aylar[d.getMonth()]}`
    : `${d.getDate()} ${s.aylar[d.getMonth()]} ${s.gunler[d.getDay()]}`;
}

/** 90 -> "1 sa 30 dk" / "1h 30min" */
export function sureYazDil(dk: number, dil: Dil): string {
  const s = sozluk(dil);
  if (dk < 60) return `${dk} ${s.dk}`;
  const saat = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan ? `${saat} ${s.sa} ${kalan} ${s.dk}` : `${saat} ${s.sa}`;
}

/** Para her iki dilde de ₺ — turist de fiyatı liradan görmeli. */
export function fiyatYazDil(f: number | undefined, dil: Dil): string | null {
  if (typeof f !== "number") return null;
  return f.toLocaleString(dil === "en" ? "en-US" : "tr-TR") + " ₺";
}

/**
 * Salonun kendi yazdığı metin için dil seçer.
 * İngilizce karşılık girilmemişse Türkçesine düşer — boş ekran yerine
 * anlaşılır bir şey görünsün.
 */
export function sec(tr: string | undefined, en: string | undefined, dil: Dil): string | undefined {
  if (dil === "en") return en?.trim() || tr;
  return tr;
}

# Salonkolay — kurulum notları

## Ortam değişkenleri

`.env.local` (yerel) veya Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...        # Neon bağlantı dizesi
PANEL_SECRET=uzun-rastgele-bir-metin # oturum çerezini imzalar
PANEL_SIFRE=salon1234                # yeni salonun ilk şifresi
SITE_URL=https://salonkolay.com      # kanonik adres (sitemap, iptal bağlantıları)
RESEND_API_KEY=re_...                # randevu bildirim e-postaları
EPOSTA_GONDEREN=Salonkolay <bildirim@send.medya333.com>
```

`SITE_URL` boşsa Vercel'in verdiği adres kullanılır; yerelde localhost'a düşer.
Alan adı alındığında burayı güncelleyin, yoksa sitemap ve müşteriye giden
iptal bağlantıları eski adresi gösterir.

**DATABASE_URL yoksa** sistem bellekte çalışır: her şey görünür ve denenebilir,
ama sunucu yeniden başlayınca randevular sıfırlanır. Demo için yeterli,
gerçek salon için değil.

**PANEL_SECRET değişirse** herkesin oturumu kapanır (şifreler etkilenmez).
Üretimde mutlaka tanımlayın; tanımsızken kodun içindeki geliştirme anahtarı
kullanılır ve bu güvenli değildir.

## Neon (ücretsiz Postgres)

1. neon.tech → ücretsiz hesap → yeni proje.
2. Dashboard'daki **Connection string**'i kopyalayın (`postgresql://...` ile başlar).
3. `DATABASE_URL` olarak yapıştırın.

Tablolar ilk istekte kendiliğinden oluşur (`src/lib/db.ts` içindeki `kur()`).
Elle SQL çalıştırmanız gerekmez.

## Resend (randevu bildirim e-postaları)

Randevu geldiğinde salona, müşteri iptal ettiğinde yine salona e-posta gider.
Gönderim **hiçbir koşulda randevuyu bozmaz**: anahtar yoksa ya da Resend cevap
vermezse randevu yine oluşur, sunucu kaydına bir satır düşer.

### 1. Alan adını doğrulayın

Resend → **Domains → Add Domain** → `send.medya333.com`.

Alt alan adı kullanmanın sebebi: `medya333.com` kökünde soğuk e-posta için
kurulmuş SPF/DKIM var. Randevu postaları ayrı bir alt alandan giderse ikisinin
itibarı birbirine karışmaz; birinden gelen şikâyet diğerini etkilemez.

Resend üç kayıt ister. Kayıtları `medya333.com`'un DNS'ini yönettiğiniz yere
girin (Vercel DNS ise **Auto Configure** düğmesi bunları kendi ekler):

| Tür | Ad (host)                             | Değer                         |
|-----|---------------------------------------|-------------------------------|
| MX  | `send.send`                           | Resend'in verdiği, öncelik 10 |
| TXT | `send.send`                           | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey.send`              | Resend'in verdiği `p=…` dizesi |

Ad sütunundaki değerler alan adı **olmadan** yazılır; sağlayıcı sonuna
`.medya333.com` ekler. Yani kayıtlar `send.send.medya333.com` ve
`resend._domainkey.send.medya333.com` olarak oluşur — iki kere "send" görmek
doğrudur, Resend SPF'i her zaman `send.` ön ekine koyar.

Kökteki mevcut DKIM kaydına dokunulmaz: Resend farklı bir seçici (`resend`)
kullanır. Kökteki DMARC kaydı alt alanlar için de geçerlidir ve bu kayıtlar
girildikten sonra hizalama sağlanır.

### 2. API anahtarı

Resend → **API Keys → Create API Key** → yetki *Sending access* yeter.
Anahtar bir kere gösterilir. `RESEND_API_KEY` olarak Vercel'e girin.

### 3. Gönderen adresi

`EPOSTA_GONDEREN=Salonkolay <bildirim@send.medya333.com>`

Tanımlı değilse kod Resend'in deneme adresine (`onboarding@resend.dev`) düşer.
O adres **yalnızca kendi Resend hesap adresinize** mail gönderebilir; gerçek
salonlara ulaşmaz. Denemeyi geçtikten sonra bu değişkeni mutlaka tanımlayın.

### 4. Doğrulama

Panel → **Ayarlar → Randevu bildirimleri** → adresi yazıp kaydedin, sonra
**deneme gönder**. Gelmezse Resend → **Logs** ekranı sebebini yazar.

### Sınırlar

Ücretsiz plan: ayda 3.000, **günde 100** e-posta, 3 alan adı. Bir randevu iki
posta üretebilir (yeni randevu + iptal), yani günde ~50 randevu sonrası sınır
sıkışır. 20-25 salona çıkıldığında ücretli plana geçmek gerekir.

## Yeni salon ekleme

1. `src/lib/salon.ts` içindeki `salonlar` dizisine yeni kayıt ekleyin
   (slug, ad, telefon, renkler, hizmetler, personel, çalışma saatleri).
2. Siteye ilk girişte kayıt veritabanına tohumlanır ve şifresi `PANEL_SIFRE`
   olur.
3. Salon sahibine `salonkolay.com/panel` adresini, slug'ını ve şifresini verin;
   **Ayarlar → Şifre** bölümünden kendi şifresini koymasını söyleyin.

Bundan sonra salonun bütün bilgileri panelden düzenlenir; kod değişmez.

## Yapı

```
src/lib/
  salon.ts      tipler, tohum veri, saf yardımcılar  (istemci de kullanır)
  salonVeri.ts  salonun veritabanı erişimi           (yalnız sunucu)
  depo.ts       randevu / kapalı saat / kasa         (yalnız sunucu)
  db.ts         Postgres havuzu ve şema              (yalnız sunucu)
  saat.ts       müsait saat hesabı, çakışma kontrolü
  sifre.ts      scrypt şifre + HMAC oturum jetonu
  oturum.ts     çerez oturumu
  bicim.ts      tarih / para / telefon biçimleri

src/app/[slug]          salonun sitesi
src/app/[slug]/randevu  müşteri randevu akışı
src/app/panel           salon paneli (giriş, bugün, takvim, kasa, ayarlar)
```

`salonVeri.ts`, `depo.ts` ve `db.ts` **istemci bileşenlerinden import edilmez** —
`pg` paketi tarayıcı paketine girer ve derleme patlar. İstemci tarafı
`salon.ts`ten yalnızca tip ve saf yardımcı alır.

## Bellek deposu neden `globalThis` üzerinde?

Next, sayfa bileşenlerini ve API yollarını ayrı paketlere derliyor; sıradan bir
modül değişkeni ikisi arasında paylaşılmıyor. Müşterinin API üzerinden aldığı
randevunun panelde görünmesi için depo `globalThis`te tutuluyor.
Postgres bağlıyken bu kodun hiçbir önemi yok.

## Sesli randevu

Panel → Takvim'deki mikrofon, tarayıcının kendi ses tanıma motorunu kullanır
(Web Speech API, `tr-TR`). Ses sunucuya gönderilmez, ek ücret yoktur.
Çalıştığı yerler: iPhone'da Safari 14.5+, Android ve masaüstünde Chrome/Edge.
Firefox desteklemiyor — orada cümle elle yazılır, çözümleme aynı şekilde çalışır.
Mikrofon için HTTPS şart (localhost hariç).

Cümleyi `src/lib/sesCoz.ts` çözüyor: kural tabanlı, saf, ağ kullanmıyor.
Çıkan sonuç doğrudan kaydedilmez; doldurulmuş form olarak gösterilir, salon
sahibi onaylar. Ses tanıma özellikle isimlerde yanılıyor.

Denemeleri çalıştırmak için:

```
npx tsx sesCoz.test.ts
```

## Görseller

Logo, kapak, galeri ve ekip fotoğrafları panelden yükleniyor (Ayarlar →
Fotoğraflar). Vercel'in dosya sistemi yazılamadığı için görseller
veritabanında `gorseller` tablosunda duruyor.

Yüklenen dosya `sharp` ile küçültülüp webp'e çevriliyor: logo 600 px,
kapak 1600 px, galeri 1400 px, ekip 800 px kare. Böylece her görsel
100-250 KB bandında kalıyor; salon başına ~10 görsel, yani ~2 MB.

Servis eden yol `/g/<id>.webp`. Adres içeriğe göre sabit olduğundan
`cache-control: immutable` veriliyor — tarayıcı ve CDN bir kez indiriyor,
veritabanına tekrar gidilmiyor. Görsel sayısı çok büyürse bu dosyayı bir
nesne deposuna (Vercel Blob, S3) taşımak yeterli; çağıran taraflar değişmez.

## KVKK

Her salonun `/[slug]/kvkk` adresinde kendi bilgileriyle üretilen bir
aydınlatma metni var. Randevu formunun son adımında onay kutusu zorunlu;
onay gelmeden API kayıt açmıyor (istek doğrudan API'ye gelse bile).

Metin `src/lib/kvkk.ts` içinde. **Bu bir şablondur, hukuki görüş değildir** —
gerçek müşteriye satmadan önce bir avukata okutun. Özellikle saklama süresi
ve yurt dışına aktarım bölümleri işletmeye göre değişir.

## Randevu iptali

Randevu alındığında müşteriye imzalı bir bağlantı veriliyor:
`/[slug]/randevu/<id>?k=<imza>`. İmza, `PANEL_SECRET` ile üretilen bir
HMAC; kimliği bilen biri bile imzasız randevuyu göremez veya iptal edemez.

Geçmiş saatli randevular iptal edilemiyor. İptal edilen randevunun saati
otomatik olarak yeniden müsait hâle geliyor.

**Not:** `PANEL_SECRET` değişirse daha önce verilmiş iptal bağlantıları
geçersiz olur (panel oturumları da kapanır).

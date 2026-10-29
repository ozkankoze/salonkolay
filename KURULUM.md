# Salonkolay — kurulum notları

## Ortam değişkenleri

`.env.local` (yerel) veya Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...        # Neon bağlantı dizesi
PANEL_SECRET=uzun-rastgele-bir-metin # oturum çerezini imzalar
PANEL_SIFRE=salon1234                # yeni salonun ilk şifresi
```

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

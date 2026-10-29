# Salonkolay

Salonlar için randevu sayfası. Tek kod tabanı, çok salon (multi-tenant):
yeni salon = yeni kayıt, yeni proje değil.

## Çalıştırma

    npm install
    npm run dev        # http://localhost:3000/demo

## Yapı

    src/lib/salon.ts   Veri modeli + salon kayıtları (şimdilik kodda)
    src/lib/saat.ts    Müsait saat hesabı ve ÇAKIŞMA KONTROLÜ (sistemin kalbi)
    src/lib/depo.ts    Randevu deposu (şimdilik bellekte, Postgres'e hazır)

    src/app/[slug]/            Salonun herkese açık randevu sayfası
    src/app/api/musait/        Bir gün için uygun saatler
    src/app/api/randevu/       Randevu oluşturma (son çakışma kontrolü burada)

## Yeni salon eklemek

`src/lib/salon.ts` içindeki `demoSalonlar` dizisine bir kayıt ekle.
Adres `salonkolay.com/<slug>` olur.

Zorunlu alanlar: `slug, ad, telefon, renk, hizmetler, personel, calisma`.
Hizmette **fiyat isteğe bağlı, süre zorunlu** — takvim süreyi kullanıyor.

## Sırada ne var

1. Postgres (`depo.ts` içi değişecek, çağıran taraflar aynı kalacak)
2. Salon paneli: bugün ekranı, onayla/iptal, saat kapatma, hizmet düzenleme
3. "WhatsApp ile hatırlat" düğmesi — yarın gelecekler listesi
4. Kasa defteri: randevudan türeyen gelir + elle gider
5. Abonelik ve tahsilat (iyzico/PayTR)

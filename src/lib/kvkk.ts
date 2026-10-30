/**
 * KVKK AYDINLATMA METNİ
 *
 * Metin her salon için kendi bilgileriyle üretilir: veri sorumlusu salonun
 * kendisidir, Salonkolay yalnızca veri işleyen sıfatıyla altyapıyı sağlar.
 *
 * ÖNEMLİ: Bu metin iyi niyetli bir şablondur, hukuki görüş değildir.
 * Gerçek müşteriye satmadan önce bir avukata okutun; özellikle saklama
 * süresi ve aktarım bölümleri işletmeye göre değişir.
 */

import type { Salon } from "./salon";

export type Bolum = { baslik: string; paragraflar: string[] };

export function aydinlatmaMetni(s: Salon): Bolum[] {
  const salon = s.ad;
  const iletisim = [s.adres, telefonYazi(s.telefon)].filter(Boolean).join(" · ");

  return [
    {
      baslik: "Veri sorumlusu kim?",
      paragraflar: [
        `Randevu sayfası üzerinden paylaştığınız kişisel verilerin veri sorumlusu ${salon}'dir.` +
          (iletisim ? ` İletişim: ${iletisim}` : ""),
        "Randevu altyapısı Salonkolay tarafından sağlanmaktadır. Salonkolay bu kapsamda veri işleyen sıfatıyla hareket eder; verilerinizi yalnızca randevunuzun oluşturulması ve salona iletilmesi için işler, kendi amaçları için kullanmaz.",
      ],
    },
    {
      baslik: "Hangi veriler işleniyor?",
      paragraflar: [
        "Yalnızca randevu için gerekli olanlar: **adınız**, **telefon numaranız**, **seçtiğiniz hizmet**, **randevu gününüz ve saatiniz** ve varsa **not alanına yazdığınız bilgi**.",
        "Kimlik numarası, adres, e-posta veya ödeme bilgisi istenmez ve saklanmaz.",
      ],
    },
    {
      baslik: "Hangi amaçla işleniyor?",
      paragraflar: [
        "Verileriniz şu amaçlarla işlenir: randevunuzun oluşturulması, randevu saatinin size ve salona hatırlatılması, randevuda değişiklik olması hâlinde size ulaşılması.",
        "Bu amaçların dışında pazarlama, profilleme veya üçüncü kişilere satış amacıyla kullanılmaz.",
      ],
    },
    {
      baslik: "Hukuki sebep nedir?",
      paragraflar: [
        "İşleme, KVKK'nın 5. maddesi kapsamında **bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması** ve **veri sorumlusunun meşru menfaati** hukuki sebeplerine dayanır. Randevu almanız bu kapsamda bir hizmet talebidir.",
      ],
    },
    {
      baslik: "Kimlere aktarılıyor?",
      paragraflar: [
        `Verileriniz ${salon} çalışanları dışında kimseyle paylaşılmaz.`,
        "Teknik olarak veriler, altyapı sağlayıcıların sunucularında barındırılır. Yurt dışında barındırma söz konusu olabilir; bu durumda aktarım KVKK'nın ilgili hükümleri çerçevesinde yapılır.",
        "Hukuken yetkili kamu kurumlarının talebi hâlinde mevzuatın gerektirdiği ölçüde paylaşım yapılabilir.",
      ],
    },
    {
      baslik: "Ne kadar süre saklanıyor?",
      paragraflar: [
        "Randevu kayıtları, randevu tarihinden itibaren salonun işletme kayıtları için gerekli olan süre boyunca saklanır. Bu sürenin sonunda silinir veya anonim hâle getirilir.",
        "Silinmesini daha erken talep edebilirsiniz; aşağıdaki haklarınız bölümüne bakın.",
      ],
    },
    {
      baslik: "Haklarınız neler?",
      paragraflar: [
        "KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.",
        `Bu haklarınızı kullanmak için ${salon} ile ${telefonYazi(s.telefon)} numarasından iletişime geçebilirsiniz.`,
      ],
    },
  ];
}

function telefonYazi(t: string): string {
  const s = t.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  if (s.length !== 10) return t;
  return `0${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 8)} ${s.slice(8)}`;
}

/** Randevu formunun yanındaki tek satırlık onay cümlesi. */
export const ONAY_CUMLESI =
  "Randevu için adımın ve telefon numaramın işlenmesine ilişkin aydınlatma metnini okudum.";

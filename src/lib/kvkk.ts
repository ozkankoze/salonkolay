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
import type { Dil } from "./dil";

export type Bolum = { baslik: string; paragraflar: string[] };

export function aydinlatmaMetni(s: Salon, dil: Dil = "tr"): Bolum[] {
  if (dil === "en") return ingilizceMetin(s);

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

/**
 * İngilizce karşılığı.
 *
 * Aynı bilgiyi verir; hukuki dayanak maddeleri Türk mevzuatına (KVKK)
 * atıf yaptığı için orada da KVKK adı geçer — turist de hangi kanuna
 * tabi olduğunu bilmeli.
 */
function ingilizceMetin(s: Salon): Bolum[] {
  const salon = s.ad;
  const iletisim = [s.adres, telefonYazi(s.telefon)].filter(Boolean).join(" · ");

  return [
    {
      baslik: "Who is the data controller?",
      paragraflar: [
        `${salon} is the data controller for the personal data you share through this booking page.` +
          (iletisim ? ` Contact: ${iletisim}` : ""),
        "The booking system is provided by Salonkolay, which acts as a data processor. It processes your data only to create your booking and pass it to the salon, and never for its own purposes.",
      ],
    },
    {
      baslik: "What data is collected?",
      paragraflar: [
        "Only what the booking needs: your **name**, **phone number**, the **service** you chose, your **date and time**, and the **note** you write, if any.",
        "No ID number, address, email or payment details are requested or stored.",
      ],
    },
    {
      baslik: "Why is it processed?",
      paragraflar: [
        "To create your booking, to remind you and the salon of the time, and to reach you if anything about the booking changes.",
        "It is not used for marketing, profiling, or sold to third parties.",
      ],
    },
    {
      baslik: "What is the legal basis?",
      paragraflar: [
        "Processing is based on Article 5 of the Turkish Personal Data Protection Law (KVKK): it is **directly related to the conclusion or performance of a contract**, and rests on the **legitimate interest of the data controller**. Making a booking is a request for service under this provision.",
      ],
    },
    {
      baslik: "Who is it shared with?",
      paragraflar: [
        `Your data is not shared with anyone outside ${salon} and its staff.`,
        "Technically, the data is held on infrastructure providers' servers, which may be located outside Türkiye. Any such transfer is made within the framework of the relevant provisions of KVKK.",
        "Data may be shared with legally authorised public authorities to the extent required by law.",
      ],
    },
    {
      baslik: "How long is it kept?",
      paragraflar: [
        "Booking records are kept for as long as the salon needs them for its business records, counted from the date of the appointment. After that they are deleted or anonymised.",
        "You may ask for earlier deletion; see your rights below.",
      ],
    },
    {
      baslik: "What are your rights?",
      paragraflar: [
        "Under Article 11 of KVKK you may: learn whether your personal data is processed, request information about it, learn the purpose of processing, ask for correction if it is incomplete or wrong, ask for its deletion or destruction, and object to the processing.",
        `To exercise these rights, contact ${salon} on ${telefonYazi(s.telefon)}.`,
      ],
    },
  ];
}

/** Randevu formunun yanındaki tek satırlık onay cümlesi. */
export const ONAY_CUMLESI =
  "Randevu için adımın ve telefon numaramın işlenmesine ilişkin aydınlatma metnini okudum.";

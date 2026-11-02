/**
 * SALONKOLAY'IN KENDİ AYDINLATMA METNİ
 *
 * ⚠️ `kvkk.ts` İLE KARIŞTIRMAYIN. O dosyadaki metin SALONUN metnidir:
 * randevu alan müşterinin verisinde veri sorumlusu salondur, Salonkolay
 * veri işleyendir. Buradaki metin ise Salonkolay'ın kendi topladığı
 * veriler içindir — salon başvuru formu, dil çerezi, panel oturumu.
 *
 * Footer'dan bir salonun KVKK sayfasına bağlanmak yanlıştı: ziyaretçi
 * platformun metnini ararken Pınar Kuaför'ün metnini okuyordu.
 *
 * ÖNEMLİ: Bu metin iyi niyetli bir şablondur, hukuki görüş değildir.
 * Yayına almadan önce bir avukata okutun; özellikle ticari unvan,
 * adres ve saklama süreleri sizin durumunuza göre doldurulmalıdır.
 */

import type { Dil } from "./dil";
import type { Bolum } from "./kvkk";

/** Platformu işleten taraf — tek yerden değiştirilsin diye burada. */
export const ISLETEN = {
  marka: "Salonkolay",
  firma: "Medya 333",
  eposta: "info@medya333.com",
  telefon: "0537 010 86 11",
};

export function platformMetni(dil: Dil = "tr"): Bolum[] {
  if (dil === "en") return ingilizce();

  return [
    {
      baslik: "Bu metin neyi kapsıyor?",
      paragraflar: [
        `Bu metin, ${ISLETEN.marka} web sitesinde (salonkolay.com) toplanan kişisel verilere ilişkindir.`,
        "**Bir salondan randevu aldığınızda** verilerinizin sorumlusu Salonkolay değil, randevu aldığınız salondur. O durumda ilgili salonun kendi sayfasındaki aydınlatma metni geçerlidir; Salonkolay yalnızca altyapıyı sağlayan veri işleyendir.",
      ],
    },
    {
      baslik: "Veri sorumlusu kim?",
      paragraflar: [
        `${ISLETEN.marka}, ${ISLETEN.firma} tarafından işletilmektedir.`,
        `İletişim: ${ISLETEN.eposta} · ${ISLETEN.telefon}`,
      ],
    },
    {
      baslik: "Hangi veriler işleniyor?",
      paragraflar: [
        "**Salon başvuru formu:** salon adı, şehir/ilçe, telefon numarası ve isteğe bağlı olarak Instagram hesabı, e-posta adresi ve not alanına yazdığınız bilgi.",
        "**Dil tercihi:** hangi dilde gezdiğinizi hatırlamak için tarayıcınıza küçük bir çerez yazılır. Kişiyi tanımlamaz.",
        "**Panel oturumu:** salon sahibi olarak panele giriş yaptığınızda, oturumunuzu açık tutan imzalı bir çerez kullanılır.",
        "**Sunucu kayıtları:** isteklerin tarihi, IP adresi ve hata kayıtları gibi teknik bilgiler güvenlik amacıyla kısa süre tutulur.",
        "Reklam veya izleme çerezi kullanılmıyor; üçüncü taraf analiz aracı çalıştırılmıyor.",
      ],
    },
    {
      baslik: "Hangi amaçla işleniyor?",
      paragraflar: [
        "Başvuru formundaki bilgiler yalnızca **size dönüş yapmak ve salon sayfanızı kurmak** için kullanılır.",
        "Teknik veriler hizmetin çalışması, kötüye kullanımın önlenmesi ve arıza tespiti için işlenir.",
        "Verileriniz pazarlama listesine eklenmez, üçüncü kişilere satılmaz.",
      ],
    },
    {
      baslik: "Hukuki sebep nedir?",
      paragraflar: [
        "Başvuru formunu doldurmanız **açık rızanıza** dayanır; formu göndermemeyi her zaman seçebilirsiniz.",
        "Panel oturumu ve teknik kayıtlar, KVKK'nın 5. maddesi kapsamında **sözleşmenin ifası** ve **veri sorumlusunun meşru menfaati** sebeplerine dayanır.",
      ],
    },
    {
      baslik: "Kimlere aktarılıyor?",
      paragraflar: [
        "Verileriniz, hizmetin çalışması için kullanılan altyapı sağlayıcıların sunucularında barındırılır: site barındırma (Vercel), veritabanı (Neon) ve e-posta gönderimi (Resend).",
        "Bu sağlayıcıların sunucuları yurt dışında bulunabilir; aktarım KVKK'nın ilgili hükümleri çerçevesinde yapılır.",
        "Bunun dışında hiçbir üçüncü kişiyle paylaşılmaz. Hukuken yetkili kamu kurumlarının talebi hâlinde mevzuatın gerektirdiği ölçüde paylaşım yapılabilir.",
      ],
    },
    {
      baslik: "Ne kadar süre saklanıyor?",
      paragraflar: [
        "Başvuru bilgileri, görüşme sonuçlanana kadar e-posta kutusunda tutulur. Anlaşma olmazsa talebiniz üzerine silinir; talep gelmezse makul bir süre sonunda kaldırılır.",
        "Dil çerezi bir yıl, panel oturum çerezi oturum süresince geçerlidir.",
        "Teknik sunucu kayıtları altyapı sağlayıcının saklama süresi kadar tutulur.",
      ],
    },
    {
      baslik: "Haklarınız neler?",
      paragraflar: [
        "KVKK'nın 11. maddesi kapsamında: verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, işlenme amacını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
        `Taleplerinizi **${ISLETEN.eposta}** adresine iletebilirsiniz. Başvurularınız en geç otuz gün içinde sonuçlandırılır.`,
      ],
    },
  ];
}

function ingilizce(): Bolum[] {
  return [
    {
      baslik: "What does this cover?",
      paragraflar: [
        `This notice covers personal data collected on the ${ISLETEN.marka} website (salonkolay.com).`,
        "**When you book with a salon**, the data controller is that salon, not Salonkolay. In that case the salon's own privacy notice applies; Salonkolay acts only as the data processor providing the infrastructure.",
      ],
    },
    {
      baslik: "Who is the data controller?",
      paragraflar: [
        `${ISLETEN.marka} is operated by ${ISLETEN.firma}.`,
        `Contact: ${ISLETEN.eposta} · ${ISLETEN.telefon}`,
      ],
    },
    {
      baslik: "What data is processed?",
      paragraflar: [
        "**Salon application form:** salon name, city/district, phone number and, optionally, Instagram handle, email address and anything you write in the notes field.",
        "**Language preference:** a small cookie remembers which language you are browsing in. It does not identify you.",
        "**Panel session:** when you log in as a salon owner, a signed cookie keeps your session open.",
        "**Server logs:** technical information such as request time, IP address and error records is kept briefly for security.",
        "No advertising or tracking cookies are used and no third-party analytics tool is loaded.",
      ],
    },
    {
      baslik: "Why is it processed?",
      paragraflar: [
        "Information in the application form is used only to **get back to you and set up your salon page**.",
        "Technical data is processed to run the service, prevent abuse and diagnose faults.",
        "Your data is not added to a marketing list and is not sold to third parties.",
      ],
    },
    {
      baslik: "On what legal basis?",
      paragraflar: [
        "Filling in the application form relies on your **explicit consent**; you can always choose not to send it.",
        "The panel session and technical records rely on **performance of a contract** and the **legitimate interest of the controller** under Article 5 of the Turkish Data Protection Law (KVKK).",
      ],
    },
    {
      baslik: "Who is it shared with?",
      paragraflar: [
        "Your data is hosted on the servers of the providers that run the service: site hosting (Vercel), database (Neon) and email delivery (Resend).",
        "Those servers may be located abroad; any transfer is made within the framework of the relevant provisions of KVKK.",
        "It is shared with no one else. Disclosure may be made to legally authorised public authorities to the extent required by law.",
      ],
    },
    {
      baslik: "How long is it kept?",
      paragraflar: [
        "Application details stay in the mailbox until the conversation concludes. If we do not work together they are deleted on your request, or removed after a reasonable period.",
        "The language cookie lasts one year; the panel session cookie lasts for the session.",
        "Technical server logs are kept for as long as the infrastructure provider retains them.",
      ],
    },
    {
      baslik: "What are your rights?",
      paragraflar: [
        "Under Article 11 of KVKK you may: learn whether your data is processed, request information about it, learn the purpose of processing, know the third parties it is transferred to at home or abroad, request correction if it is incomplete or wrong, request erasure or destruction, and claim compensation if you suffer damage.",
        `You can send your requests to **${ISLETEN.eposta}**. Requests are answered within thirty days at the latest.`,
      ],
    },
  ];
}

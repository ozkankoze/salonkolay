import { telefonYaz } from "@/lib/bicim";
import Kabuk, { korunanSalon } from "../Kabuk";
import {
  BilgiFormu,
  DilFormu,
  EkipFormu,
  HizmetFormu,
  SaatFormu,
  SifreFormu,
} from "./Formlar";
import FotoFormu from "./FotoFormu";
import BildirimFormu from "./BildirimFormu";
import { epostaKuruluMu } from "@/lib/eposta";

export const dynamic = "force-dynamic";

export default async function Ayarlar() {
  const salon = await korunanSalon();

  return (
    <Kabuk salon={salon} aktif="/panel/ayarlar" baslik="Ayarlar">
      <p className="mb-6 rounded-2xl bg-kagit px-4 py-3 text-[14.5px] text-gri">
        Buradaki değişiklikler <b className="text-murekkep">salonkolay.com/{salon.slug}</b>{" "}
        adresindeki sitenize anında yansır.
      </p>

      <Bolum baslik="Salon bilgileri">
        <BilgiFormu
          ad={salon.ad}
          slogan={salon.slogan}
          hakkindaBaslik={salon.hakkindaBaslik}
          hakkinda={salon.hakkinda}
          telefon={telefonYaz(salon.telefon)}
          adres={salon.adres}
          instagram={salon.instagram}
        />
      </Bolum>

      <Bolum baslik="İngilizce (dil eklentisi)">
        <DilFormu
          slug={salon.slug}
          ingilizce={salon.ingilizce}
          sloganEn={salon.sloganEn}
          hakkindaBaslikEn={salon.hakkindaBaslikEn}
          hakkindaEn={salon.hakkindaEn}
        />
      </Bolum>

      <Bolum baslik="Randevu bildirimleri">
        <BildirimFormu
          eposta={salon.eposta}
          bildirim={salon.bildirim}
          kurulu={epostaKuruluMu()}
        />
      </Bolum>

      <Bolum baslik="Fotoğraflar">
        <FotoFormu
          logo={salon.logo}
          kapak={salon.kapak}
          galeri={salon.galeri}
          personel={salon.personel}
        />
      </Bolum>

      <Bolum baslik="Hizmetler ve fiyatlar">
        <HizmetFormu baslangic={salon.hizmetler} ingilizce={salon.ingilizce} />
      </Bolum>

      <Bolum baslik="Çalışma saatleri">
        <SaatFormu calisma={salon.calisma} />
      </Bolum>

      <Bolum baslik="Ekip">
        <EkipFormu
          baslangic={salon.personel}
          hizmetler={salon.hizmetler}
          ingilizce={salon.ingilizce}
        />
      </Bolum>

      <Bolum baslik="Şifre">
        <SifreFormu />
      </Bolum>
    </Kabuk>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-3xl border border-cizgi bg-kart p-5 sm:p-6">
      <h2 className="mb-4 text-[17px] font-semibold tracking-[-0.015em]">{baslik}</h2>
      {children}
    </section>
  );
}

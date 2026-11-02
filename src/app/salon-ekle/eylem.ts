"use server";

import { epostaGonder, epostaKuruluMu, gecerliEposta } from "@/lib/eposta";
import { sozluk, dilAyikla } from "@/lib/dil";

/** Başvurunun düşeceği adres. */
const KUTU = "info@medya333.com";

export type BasvuruDurumu =
  | { hal: "bos" }
  | { hal: "tamam" }
  | { hal: "hata"; mesaj: string; telefon?: boolean };

function temiz(x: FormDataEntryValue | null, uzunluk = 200): string {
  return String(x ?? "").replace(/\s+/g, " ").trim().slice(0, uzunluk);
}

function kacis(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export async function salonBasvurusu(
  _onceki: BasvuruDurumu,
  form: FormData,
): Promise<BasvuruDurumu> {
  const t = sozluk(dilAyikla(form.get("dil")) ?? "tr");

  // Bal kabı: insan görmüyor, dolduran robottur. Sessizce başarılı diyoruz.
  if (temiz(form.get("web"))) return { hal: "tamam" };

  const ad = temiz(form.get("ad"), 120);
  const sehir = temiz(form.get("sehir"), 120);
  const telefon = temiz(form.get("telefon"), 40);
  const instagram = temiz(form.get("instagram"), 80);
  const eposta = temiz(form.get("eposta"), 160);
  const not = temiz(form.get("not"), 1200);

  if (!ad || !sehir || !telefon) return { hal: "hata", mesaj: t.sHataAlan };

  const rakam = telefon.replace(/\D/g, "");
  if (rakam.length < 10 || rakam.length > 15) return { hal: "hata", mesaj: t.sHataTelefon };
  if (eposta && !gecerliEposta(eposta)) return { hal: "hata", mesaj: t.sHataTelefon };

  if (!epostaKuruluMu()) {
    // Anahtar yoksa başvuruyu kaybetmiş gibi yapmıyoruz: sunucu
    // kaydına düşüyor ve kullanıcıya telefon veriliyor.
    console.warn("[salon-ekle] e-posta kurulu değil, başvuru:", { ad, sehir, telefon });
    return { hal: "hata", mesaj: t.sHataGonderim, telefon: true };
  }

  const satirlar: [string, string][] = [
    ["Salon", ad],
    ["Şehir", sehir],
    ["Telefon", telefon],
    ["Instagram", instagram || "—"],
    ["E-posta", eposta || "—"],
    ["Not", not || "—"],
  ];

  const sonuc = await epostaGonder({
    kime: KUTU,
    konu: `Salonkolay başvurusu — ${ad}`,
    metin: satirlar.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html:
      `<h2 style="font:600 18px system-ui;margin:0 0 12px">Salonkolay başvurusu</h2>` +
      `<table style="font:14px system-ui;border-collapse:collapse">` +
      satirlar
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 14px 4px 0;color:#777">${kacis(k)}</td>` +
            `<td style="padding:4px 0"><strong>${kacis(v)}</strong></td></tr>`,
        )
        .join("") +
      `</table>`,
  });

  if (!sonuc.tamam) {
    console.warn("[salon-ekle] gönderilemedi:", sonuc.sebep, { ad, sehir, telefon });
    return { hal: "hata", mesaj: t.sHataGonderim, telefon: true };
  }

  return { hal: "tamam" };
}

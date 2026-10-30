/**
 * E-POSTA GÖNDERİMİ VE METİNLERİ
 *
 * Resend'in HTTP arayüzü kullanılıyor — ek paket yok, tek bir fetch.
 *
 * Tasarım kuralı: e-posta hiçbir koşulda asıl işi bozmaz. Anahtar yoksa,
 * servis hata verirse veya ağ koparsa randevu yine oluşur; burası
 * `{ tamam: false }` döner. Müşteri, salonun e-posta ayarı yüzünden
 * randevusuz kalmamalı.
 */

const UC = "https://api.resend.com/emails";

export type Mesaj = { konu: string; html: string; metin: string };
export type Sonuc = { tamam: true } | { tamam: false; sebep: string };

export function epostaKuruluMu(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function gecerliEposta(adres: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adres.trim());
}

/** Gönderen adresi; doğrulanmış alan adı yoksa Resend'in deneme adresi. */
function gonderen(): string {
  return process.env.EPOSTA_GONDEREN?.trim() || "Salonkolay <onboarding@resend.dev>";
}

export async function epostaGonder(istek: { kime: string } & Mesaj): Promise<Sonuc> {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) return { tamam: false, sebep: "E-posta gönderimi açık değil." };

  const hedef = istek.kime.trim();
  if (!gecerliEposta(hedef)) return { tamam: false, sebep: "E-posta adresi geçersiz." };

  try {
    const cevap = await fetch(UC, {
      method: "POST",
      headers: { authorization: `Bearer ${anahtar}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: gonderen(),
        to: [hedef],
        subject: istek.konu,
        html: istek.html,
        text: istek.metin,
      }),
      // Randevu cevabını bekletmemek için kısa tutuluyor.
      signal: AbortSignal.timeout(8000),
    });

    if (!cevap.ok) {
      const govde = (await cevap.text()).slice(0, 300);
      console.error("[eposta] gönderilemedi:", cevap.status, govde);
      return {
        tamam: false,
        sebep:
          cevap.status === 401 || cevap.status === 403
            ? "E-posta anahtarı kabul edilmedi."
            : "E-posta servisi şu an cevap vermedi.",
      };
    }
    return { tamam: true };
  } catch (e) {
    console.error("[eposta] gönderilemedi:", e instanceof Error ? e.message : e);
    return { tamam: false, sebep: "E-posta gönderilemedi, bağlantı kurulamadı." };
  }
}

/* ───────────────────── metinler ───────────────────── */

export type RandevuBilgisi = {
  salonAdi: string;
  musteri: string;
  telefon: string;
  gun: string;
  saat: string;
  hizmetler: string;
  kisi?: string;
  tutar?: string;
  not?: string;
  panelAdresi: string;
};

/** HTML'e gömülen her değer kaçışlanır — isim alanı serbest metin. */
function kacis(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function kabuk(baslik: string, vurgu: string, satirlar: [string, string][], panelAdresi: string) {
  const govde = satirlar
    .map(
      ([e, d]) => `
        <tr>
          <td style="padding:7px 0;color:#6f5b65;font-size:14px;width:120px;vertical-align:top">${kacis(e)}</td>
          <td style="padding:7px 0;color:#2b1620;font-size:15px;font-weight:500">${kacis(d)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#fdf6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;width:100%">
    <tr><td style="background:#ffffff;border-radius:18px;padding:28px 24px">
      <p style="margin:0 0 6px;color:#b84a6e;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase">${kacis(baslik)}</p>
      <h1 style="margin:0 0 18px;color:#2b1620;font-size:22px;line-height:1.3;font-weight:700">${kacis(vurgu)}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #f3e2e8">${govde}</table>
      <a href="${panelAdresi}" style="display:inline-block;margin-top:22px;background:#b84a6e;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:12px;font-size:15px;font-weight:600">Panelde aç</a>
    </td></tr>
    <tr><td style="padding:16px 8px;text-align:center;color:#a8949d;font-size:12px">
      Salonkolay · bu bildirimi salon panelinizden kapatabilirsiniz
    </td></tr>
  </table>
</body></html>`;
}

function duzMetin(baslik: string, satirlar: [string, string][], panelAdresi: string): string {
  return (
    `${baslik}\n\n` +
    satirlar.map(([e, d]) => `${e}: ${d}`).join("\n") +
    `\n\nPanelde aç: ${panelAdresi}\n`
  );
}

function satirlar(b: RandevuBilgisi): [string, string][] {
  const l: [string, string][] = [
    ["Müşteri", b.musteri],
    ["Telefon", b.telefon],
    ["Gün", b.gun],
    ["Saat", b.saat],
    ["Hizmet", b.hizmetler],
  ];
  if (b.kisi) l.push(["Kim bakacak", b.kisi]);
  if (b.tutar) l.push(["Tutar", b.tutar]);
  if (b.not) l.push(["Not", b.not]);
  return l;
}

export function yeniRandevuPostasi(b: RandevuBilgisi): Mesaj {
  const l = satirlar(b);
  const vurgu = `${b.gun} · ${b.saat}`;
  return {
    konu: `Yeni randevu: ${b.gun} ${b.saat} — ${b.musteri}`,
    html: kabuk("Yeni randevu", vurgu, l, b.panelAdresi),
    metin: duzMetin(`${b.salonAdi} — yeni randevu`, l, b.panelAdresi),
  };
}

export function iptalPostasi(b: RandevuBilgisi): Mesaj {
  const l = satirlar(b);
  const vurgu = `${b.gun} · ${b.saat}`;
  return {
    konu: `İptal edildi: ${b.gun} ${b.saat} — ${b.musteri}`,
    html: kabuk("Müşteri randevusunu iptal etti", vurgu, l, b.panelAdresi),
    metin: duzMetin(`${b.salonAdi} — randevu iptal edildi`, l, b.panelAdresi),
  };
}

/** Müşteri randevusunu başka bir saate taşıdığında. */
export function ertelePostasi(b: RandevuBilgisi, eski: { gun: string; saat: string }): Mesaj {
  const l: [string, string][] = [["Eski saat", `${eski.gun} · ${eski.saat}`], ...satirlar(b)];
  const vurgu = `${b.gun} · ${b.saat}`;
  return {
    konu: `Saat değişti: ${b.gun} ${b.saat} — ${b.musteri}`,
    html: kabuk("Müşteri randevusunu başka bir saate taşıdı", vurgu, l, b.panelAdresi),
    metin: duzMetin(`${b.salonAdi} — randevu saati değişti`, l, b.panelAdresi),
  };
}

/** Ertesi günün randevu listesi — her akşam salona gider. */
export function gunlukOzetPostasi(o: {
  salonAdi: string;
  gun: string;
  satirlar: { saat: string; musteri: string; telefon: string; hizmetler: string; kisi?: string }[];
  panelAdresi: string;
}): Mesaj {
  const adet = o.satirlar.length;
  const liste: [string, string][] = o.satirlar.map((r) => [
    r.saat,
    [r.musteri, r.hizmetler, r.kisi, r.telefon].filter(Boolean).join(" · "),
  ]);

  return {
    konu: `Yarın ${adet} randevunuz var — ${o.gun}`,
    html: kabuk("Yarının programı", `${o.gun} · ${adet} randevu`, liste, o.panelAdresi),
    metin: duzMetin(`${o.salonAdi} — yarın ${adet} randevu (${o.gun})`, liste, o.panelAdresi),
  };
}

export function denemePostasi(salonAdi: string, panelAdresi: string): Mesaj {
  const l: [string, string][] = [
    ["Salon", salonAdi],
    ["Durum", "Bildirim ayarınız çalışıyor"],
  ];
  return {
    konu: `Salonkolay deneme e-postası — ${salonAdi}`,
    html: kabuk(
      "Deneme",
      "Bildirimler çalışıyor",
      l,
      panelAdresi
    ),
    metin: duzMetin(
      `${salonAdi} — deneme e-postası\n\nBu mesajı aldıysanız randevu bildirimleri de bu adrese gelecek.`,
      l,
      panelAdresi
    ),
  };
}

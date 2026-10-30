"use client";

import { useActionState, useEffect, useState } from "react";
import type { Hizmet, Personel } from "@/lib/salon";
import { ayarKaydetEylem, dilAyarEylem, sifreEylem } from "../eylemler";

const giris =
  "w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana";

function Durum({ hata }: { hata: string | null }) {
  if (!hata) return null;
  const iyi = hata === "tamam";
  return (
    <p
      role="status"
      className={`mt-3 rounded-xl px-4 py-3 text-[14px] ${
        iyi ? "bg-[#e8f5ef] text-[#146b48]" : "bg-yumusak text-ana-koyu"
      }`}
    >
      {iyi ? "Kaydedildi." : hata}
    </p>
  );
}

function Kaydet({ bekliyor }: { bekliyor: boolean }) {
  return (
    <button
      disabled={bekliyor}
      className="mt-4 rounded-xl bg-ana px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
    >
      {bekliyor ? "Kaydediliyor…" : "Kaydet"}
    </button>
  );
}

/* ───────────── salon bilgileri ───────────── */

export function BilgiFormu({
  ad,
  slogan,
  hakkindaBaslik,
  hakkinda,
  telefon,
  adres,
  instagram,
}: {
  ad: string;
  slogan?: string;
  hakkindaBaslik?: string;
  hakkinda?: string;
  telefon: string;
  adres?: string;
  instagram?: string;
}) {
  const [durum, gonder, bekliyor] = useActionState(ayarKaydetEylem, null);
  return (
    <form action={gonder}>
      <div className="grid gap-3 sm:grid-cols-2">
        <L e="Salon adı">
          <input name="ad" defaultValue={ad} className={giris} />
        </L>
        <L e="Telefon (WhatsApp)">
          <input name="telefon" defaultValue={telefon} inputMode="tel" className={giris} />
        </L>
        <L e="Kısa tanıtım">
          <input name="slogan" defaultValue={slogan ?? ""} className={giris} />
        </L>
        <L e="Instagram">
          <input name="instagram" defaultValue={instagram ?? ""} placeholder="pinarkuafor" className={giris} />
        </L>
      </div>

      <L e="Adres">
        <input name="adres" defaultValue={adres ?? ""} className={`${giris} mt-3`} />
      </L>
      <L e="“Hakkımızda” başlığı">
        <input name="hakkindaBaslik" defaultValue={hakkindaBaslik ?? ""} className={`${giris} mt-3`} />
      </L>
      <L e="“Hakkımızda” yazısı">
        <textarea name="hakkinda" defaultValue={hakkinda ?? ""} rows={4} className={`${giris} mt-3`} />
      </L>
      <Durum hata={durum} />
      <Kaydet bekliyor={bekliyor} />
    </form>
  );
}

function L({ e, children }: { e: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gri">{e}</span>
      {children}
    </label>
  );
}

/* ───────────── İngilizce dil eklentisi ───────────── */

/** Açıldığında salonun sitesinde EN/TR düğmesi görünür. */
export function DilFormu({
  ingilizce,
  sloganEn,
  hakkindaBaslikEn,
  hakkindaEn,
  slug,
}: {
  ingilizce?: boolean;
  sloganEn?: string;
  hakkindaBaslikEn?: string;
  hakkindaEn?: string;
  slug: string;
}) {
  const [durum, gonder, bekliyor] = useActionState(dilAyarEylem, null);
  const [acik, setAcik] = useState(Boolean(ingilizce));

  // Kayıttan sonra sunucu yeni değeri gönderir; anahtar kayıtlı durumu
  // göstersin, ekranda kalmış eski seçimi değil.
  useEffect(() => setAcik(Boolean(ingilizce)), [ingilizce]);

  return (
    <form action={gonder}>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="ingilizce"
          value="evet"
          checked={acik}
          onChange={(e) => setAcik(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#b84a6e]"
        />
        <span>
          <span className="block text-[15px] font-medium">İngilizce sayfa açık</span>
          <span className="mt-0.5 block text-[13.5px] text-gri">
            Sitenizin sağ üstünde <b className="text-murekkep">EN</b> düğmesi çıkar. Randevu akışı,
            iptal sayfası ve KVKK metni hazır çevrilmiş — aşağıdaki alanlar yalnızca sizin kendi
            yazdığınız metinler için.
          </span>
        </span>
      </label>

      <div className={acik ? "mt-4" : "mt-4 opacity-40"}>
        <L e="Kısa tanıtım (İngilizce)">
          <input
            name="sloganEn"
            defaultValue={sloganEn ?? ""}
            disabled={!acik}
            placeholder="Hair & Beauty · Kadıköy, İstanbul"
            className={giris}
          />
        </L>
        <L e="“Hakkımızda” başlığı (İngilizce)">
          <input
            name="hakkindaBaslikEn"
            defaultValue={hakkindaBaslikEn ?? ""}
            disabled={!acik}
            placeholder="Ten years on the same street"
            className={`${giris} mt-3`}
          />
        </L>
        <L e="“Hakkımızda” yazısı (İngilizce)">
          <textarea
            name="hakkindaEn"
            defaultValue={hakkindaEn ?? ""}
            disabled={!acik}
            rows={4}
            className={`${giris} mt-3`}
          />
        </L>
        <p className="mt-3 text-[13px] text-silik">
          Boş bıraktığınız her alanda Türkçesi görünür — İngilizce sayfa yarım kalmaz. Hizmet
          adlarının ve ünvanların İngilizcesini kendi bölümlerinde girebilirsiniz.
        </p>
      </div>

      <Durum hata={durum} />
      <Kaydet bekliyor={bekliyor} />

      {acik && Boolean(ingilizce) && (
        <a
          href={`/${slug}?dil=en`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 ml-3 inline-block text-[14px] font-medium text-ana"
        >
          İngilizce sayfayı gör →
        </a>
      )}
    </form>
  );
}

/* ───────────── hizmetler ───────────── */

export function HizmetFormu({
  baslangic,
  ingilizce,
}: {
  baslangic: Hizmet[];
  ingilizce?: boolean;
}) {
  const [durum, gonder, bekliyor] = useActionState(ayarKaydetEylem, null);
  const [liste, setListe] = useState<Hizmet[]>(baslangic);

  const degistir = (i: number, yama: Partial<Hizmet>) =>
    setListe((o) => o.map((h, j) => (j === i ? { ...h, ...yama } : h)));

  return (
    <form action={gonder}>
      <input type="hidden" name="hizmetler" value={JSON.stringify(liste)} />

      <ul className="space-y-3">
        {liste.map((h, i) => (
          <li key={h.id} className="rounded-2xl border border-cizgi p-4">
            <L e="Hizmet adı">
              <input
                value={h.ad}
                onChange={(e) => degistir(i, { ad: e.target.value })}
                placeholder="Kadın saç kesimi"
                className={giris}
              />
            </L>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <L e="Süre (dk)">
                <input
                  value={h.dakika}
                  onChange={(e) => degistir(i, { dakika: Number(e.target.value) || 0 })}
                  inputMode="numeric"
                  className={giris}
                />
              </L>
              <L e="Fiyat (₺)">
                <input
                  value={h.fiyat ?? ""}
                  onChange={(e) =>
                    degistir(i, {
                      fiyat: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  inputMode="numeric"
                  placeholder="boş = salonda"
                  className={giris}
                />
              </L>
            </div>

            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              <L e="Başlık">
                <input
                  value={h.grup ?? ""}
                  onChange={(e) => degistir(i, { grup: e.target.value || undefined })}
                  placeholder="Saç, Renk, Bakım…"
                  className={giris}
                />
              </L>
              <L e="Not">
                <input
                  value={h.aciklama ?? ""}
                  onChange={(e) => degistir(i, { aciklama: e.target.value || undefined })}
                  placeholder="Fiyat boşsa burası görünür"
                  className={giris}
                />
              </L>
            </div>

            {ingilizce && (
              <details className="mt-2.5">
                <summary className="cursor-pointer text-[13.5px] text-gri">
                  İngilizcesi{" "}
                  <span className="text-silik">{h.adEn ? `(${h.adEn})` : "(girilmedi)"}</span>
                </summary>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <L e="Hizmet adı (EN)">
                    <input
                      value={h.adEn ?? ""}
                      onChange={(e) => degistir(i, { adEn: e.target.value || undefined })}
                      placeholder="Women's haircut"
                      className={giris}
                    />
                  </L>
                  <L e="Başlık (EN)">
                    <input
                      value={h.grupEn ?? ""}
                      onChange={(e) => degistir(i, { grupEn: e.target.value || undefined })}
                      placeholder="Hair, Colour, Care…"
                      className={giris}
                    />
                  </L>
                  <L e="Not (EN)">
                    <input
                      value={h.aciklamaEn ?? ""}
                      onChange={(e) => degistir(i, { aciklamaEn: e.target.value || undefined })}
                      className={giris}
                    />
                  </L>
                </div>
              </details>
            )}

            <button
              type="button"
              onClick={() => setListe((o) => o.filter((_, j) => j !== i))}
              className="mt-2.5 text-[13.5px] text-silik"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          setListe((o) => [
            ...o,
            { id: "h" + Math.random().toString(36).slice(2, 7), ad: "", dakika: 30 },
          ])
        }
        className="mt-3 w-full rounded-xl border border-dashed border-cizgi py-3 text-[14.5px] font-medium text-ana"
      >
        + Hizmet ekle
      </button>

      <p className="mt-3 text-[13px] text-silik">
        Fiyatı boş bırakırsanız sitede “Salonda belirlenir” yazar. Süre zorunlu — takvim ona göre
        yerleştiriyor.
      </p>

      <Durum hata={durum} />
      <Kaydet bekliyor={bekliyor} />
    </form>
  );
}

/* ───────────── ekip ───────────── */

export function EkipFormu({
  baslangic,
  hizmetler,
  ingilizce,
}: {
  baslangic: Personel[];
  hizmetler: Hizmet[];
  ingilizce?: boolean;
}) {
  const [durum, gonder, bekliyor] = useActionState(ayarKaydetEylem, null);
  const [liste, setListe] = useState<Personel[]>(baslangic);

  const degistir = (i: number, yama: Partial<Personel>) =>
    setListe((o) => o.map((p, j) => (j === i ? { ...p, ...yama } : p)));

  return (
    <form action={gonder}>
      <input type="hidden" name="personel" value={JSON.stringify(liste)} />

      <ul className="space-y-3">
        {liste.map((p, i) => (
          <li key={p.id} className="rounded-2xl border border-cizgi p-4">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                value={p.ad}
                onChange={(e) => degistir(i, { ad: e.target.value })}
                placeholder="Adı"
                className={giris}
              />
              <input
                value={p.unvan ?? ""}
                onChange={(e) => degistir(i, { unvan: e.target.value || undefined })}
                placeholder="Ünvanı (Renk uzmanı…)"
                className={giris}
              />
              {ingilizce && (
                <input
                  value={p.unvanEn ?? ""}
                  onChange={(e) => degistir(i, { unvanEn: e.target.value || undefined })}
                  placeholder="Ünvanı — İngilizcesi (Colour specialist…)"
                  className={`${giris} sm:col-span-2`}
                />
              )}
            </div>

            <details className="mt-2.5">
              <summary className="cursor-pointer text-[13.5px] text-gri">
                Hangi hizmetleri yapıyor?{" "}
                <span className="text-silik">
                  ({p.hizmetler?.length ? `${p.hizmetler.length} hizmet` : "hepsi"})
                </span>
              </summary>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {hizmetler.map((h) => {
                  const hepsi = !p.hizmetler;
                  const isaretli = hepsi || p.hizmetler!.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        const mevcut = p.hizmetler ?? hizmetler.map((x) => x.id);
                        const sonraki = mevcut.includes(h.id)
                          ? mevcut.filter((x) => x !== h.id)
                          : [...mevcut, h.id];
                        degistir(i, {
                          hizmetler: sonraki.length === hizmetler.length ? undefined : sonraki,
                        });
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[13.5px] ${
                        isaretli ? "border-ana bg-yumusak text-ana-koyu" : "border-cizgi text-silik"
                      }`}
                    >
                      {h.ad}
                    </button>
                  );
                })}
              </div>
            </details>

            <button
              type="button"
              onClick={() => setListe((o) => o.filter((_, j) => j !== i))}
              className="mt-2.5 text-[13.5px] text-silik"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          setListe((o) => [...o, { id: "p" + Math.random().toString(36).slice(2, 7), ad: "" }])
        }
        className="mt-3 w-full rounded-xl border border-dashed border-cizgi py-3 text-[14.5px] font-medium text-ana"
      >
        + Kişi ekle
      </button>

      <Durum hata={durum} />
      <Kaydet bekliyor={bekliyor} />
    </form>
  );
}

/* ───────────── çalışma saatleri ───────────── */

export function SaatFormu({
  calisma,
}: {
  calisma: { gun: number; acilis: string; kapanis: string; kapali?: boolean }[];
}) {
  const [durum, gonder, bekliyor] = useActionState(ayarKaydetEylem, null);
  const adlar = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const sira = [1, 2, 3, 4, 5, 6, 0];
  const [kapalilar, setKapalilar] = useState<Record<number, boolean>>(
    Object.fromEntries(calisma.map((c) => [c.gun, Boolean(c.kapali)]))
  );

  return (
    <form action={gonder}>
      <ul className="divide-y divide-cizgi">
        {sira.map((g) => {
          const c = calisma.find((x) => x.gun === g);
          const kapali = kapalilar[g] ?? false;
          return (
            <li key={g} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-[92px] shrink-0 text-[15px] font-medium">{adlar[g]}</span>

              <label className="flex shrink-0 items-center gap-2 text-[14px] text-gri">
                <input
                  type="checkbox"
                  name={`calisma_${g}_kapali`}
                  value="evet"
                  checked={kapali}
                  onChange={(e) => setKapalilar((o) => ({ ...o, [g]: e.target.checked }))}
                  className="h-[17px] w-[17px] accent-[#b84a6e]"
                />
                Kapalı
              </label>

              <div className={`ml-auto flex items-center gap-2 ${kapali ? "opacity-35" : ""}`}>
                <input
                  type="time"
                  name={`calisma_${g}_acilis`}
                  defaultValue={c?.acilis ?? "09:00"}
                  disabled={kapali}
                  className="rounded-lg border border-cizgi bg-kagit px-2.5 py-2 text-[14.5px] outline-none focus:border-ana"
                />
                <span className="text-silik">–</span>
                <input
                  type="time"
                  name={`calisma_${g}_kapanis`}
                  defaultValue={c?.kapanis ?? "19:00"}
                  disabled={kapali}
                  className="rounded-lg border border-cizgi bg-kagit px-2.5 py-2 text-[14.5px] outline-none focus:border-ana"
                />
              </div>

              {/* disabled alanlar gönderilmez; değerleri gizli alanla taşıyoruz */}
              {kapali && (
                <>
                  <input type="hidden" name={`calisma_${g}_acilis`} value={c?.acilis ?? "09:00"} />
                  <input type="hidden" name={`calisma_${g}_kapanis`} value={c?.kapanis ?? "19:00"} />
                </>
              )}
            </li>
          );
        })}
      </ul>
      <Durum hata={durum} />
      <Kaydet bekliyor={bekliyor} />
    </form>
  );
}

/* ───────────── şifre ───────────── */

export function SifreFormu() {
  const [durum, gonder, bekliyor] = useActionState(sifreEylem, null);
  return (
    <form action={gonder} className="grid gap-3 sm:grid-cols-2">
      <L e="Mevcut şifre">
        <input name="eski" type="password" className={giris} />
      </L>
      <L e="Yeni şifre">
        <input name="yeni" type="password" placeholder="en az 6 karakter" className={giris} />
      </L>
      <div className="sm:col-span-2">
        <Durum hata={durum} />
        <Kaydet bekliyor={bekliyor} />
      </div>
    </form>
  );
}

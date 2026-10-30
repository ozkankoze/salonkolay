"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type Salon } from "@/lib/salon";
import {
  doldur,
  gunYazDil,
  sureYazDil,
  fiyatYazDil,
  dilliAdres,
  sec,
  type Dil,
  type Sozluk,
} from "@/lib/dil";

type Adim = 1 | 2 | 3 | 4 | 5;


function gunAnahtar(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Randevu({
  salon,
  dil,
  t,
}: {
  salon: Salon;
  dil: Dil;
  t: Sozluk;
}) {
  const yol = (a: string) => dilliAdres(a, dil);
  const [adim, setAdim] = useState<Adim>(1);
  const [secili, setSecili] = useState<string[]>([]);
  const [personel, setPersonel] = useState("farketmez");
  const [gun, setGun] = useState("");
  const [saat, setSaat] = useState("");
  const [ad, setAd] = useState("");
  const [tel, setTel] = useState("");
  const [not, setNot] = useState("");
  const [saatler, setSaatler] = useState<string[] | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [onay, setOnay] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [sonuc, setSonuc] = useState<null | { id: string; anahtar?: string }>(null);

  const hizmetler = useMemo(
    () => salon.hizmetler.filter((h) => secili.includes(h.id)),
    [salon.hizmetler, secili]
  );
  const toplamDk = hizmetler.reduce((t, h) => t + h.dakika, 0);
  const fiyatlar = hizmetler.map((h) => h.fiyat);
  const tamFiyat = fiyatlar.every((f) => typeof f === "number");
  const toplamFiyat = tamFiyat ? (fiyatlar as number[]).reduce((a, b) => a + b, 0) : undefined;

  /** seçilen hizmetleri yapabilen personel */
  const uygunPersonel = useMemo(
    () => salon.personel.filter((p) => !p.hizmetler || secili.every((h) => p.hizmetler!.includes(h))),
    [salon.personel, secili]
  );

  const gunler = useMemo(() => {
    const liste: { anahtar: string; d: Date; kapali: boolean }[] = [];
    const bas = new Date();
    for (let i = 0; i < salon.ufukGun; i++) {
      const d = new Date(bas.getFullYear(), bas.getMonth(), bas.getDate() + i);
      const c = salon.calisma.find((x) => x.gun === d.getDay());
      liste.push({ anahtar: gunAnahtar(d), d, kapali: !c || !!c.kapali });
    }
    return liste;
  }, [salon.calisma, salon.ufukGun]);

  // gün seçilince müsait saatleri çek
  useEffect(() => {
    if (!gun || toplamDk <= 0) return;
    let iptal = false;
    setSaatler(null);
    setSaat("");
    const q = new URLSearchParams({
      salon: salon.slug,
      gun,
      dk: String(toplamDk),
      personel,
    });
    fetch(`/api/musait?${q}`)
      .then((r) => r.json())
      .then((v) => {
        if (!iptal) setSaatler(v.saatler ?? []);
      })
      .catch(() => !iptal && setSaatler([]));
    return () => {
      iptal = true;
    };
  }, [gun, toplamDk, personel, salon.slug]);

  function hizmetDegistir(id: string) {
    setSecili((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setGun("");
    setSaat("");
  }

  async function gonder() {
    setHata("");
    if (ad.trim().length < 2) return setHata(t.adiniziYazin);
    const temizTel = tel.replace(/\D/g, "");
    if (temizTel.length < 10) return setHata(t.telefonEksik);
    if (!onay) return setHata(t.onaylayin);

    setGonderiliyor(true);
    try {
      const y = await fetch("/api/randevu", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salon: salon.slug,
          gun,
          saat,
          hizmetIds: secili,
          personelId: personel,
          ad: ad.trim(),
          telefon: temizTel,
          not: not.trim() || undefined,
          kvkk: true,
        }),
      }).then((r) => r.json());
      if (y.hata) setHata(y.hata);
      else setSonuc({ id: y.id, anahtar: y.anahtar });
    } catch {
      setHata(t.baglantiKurulamadi);
    } finally {
      setGonderiliyor(false);
    }
  }

  const R = salon.renk;

  // ——— onay ekranı ———
  if (sonuc) {
    const d = gun ? new Date(gun) : null;
    return (
      <div className="gir rounded-3xl border border-cizgi bg-kart p-7 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-yumusak text-[26px]">
          ✓
        </div>
        <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">{t.randevunuzAlindi}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-gri">
          {d && (
            <>
              <b className="text-murekkep">
                {gunYazDil(gun, dil)}
              </b>{" "}
              <b className="text-murekkep">{saat}</b>
            </>
          )}
          <br />
          {hizmetler.map((h) => sec(h.ad, h.adEn, dil)).join(", ")}
        </p>
        <p className="mt-4 text-[14px] text-silik">
          {t.salonOnaylayinca}
        </p>

        {sonuc.anahtar && (
          <div className="mt-5 rounded-2xl bg-kagit p-4">
            <p className="text-[13.5px] leading-relaxed text-gri">
              {t.baglantiyiSaklayin} <b className="text-murekkep">{t.iptalEtmek}</b>{" "}
              {t.icinBaglanti}
            </p>
            <Link
              href={yol(`/${salon.slug}/randevu/${sonuc.id}?k=${sonuc.anahtar}`)}
              className="mt-2.5 block rounded-xl py-3 text-center text-[15px] font-semibold text-white"
              style={{ background: salon.koyu }}
            >
              {t.randevumuGoruntule}
            </Link>
            <button
              type="button"
              onClick={() => {
                const adres = `${window.location.origin}/${salon.slug}/randevu/${sonuc.id}?k=${sonuc.anahtar}`;
                navigator.clipboard?.writeText(adres).then(
                  () => setKopyalandi(true),
                  () => setKopyalandi(false)
                );
              }}
              className="mt-2 w-full rounded-xl border border-cizgi py-2.5 text-[13.5px] font-medium"
            >
              {kopyalandi ? t.baglantiKopyalandi : t.baglantiyiKopyala}
            </button>
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <a
            href={`https://wa.me/${salon.telefon}?text=${encodeURIComponent(
              doldur(t.waAldimMesaji, { gun, saat, ad })
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl py-3.5 text-[15px] font-semibold text-white"
            style={{ background: R }}
          >
            {t.whatsapptanYaz}
          </a>
          <a
            href={`tel:+${salon.telefon}`}
            className="rounded-xl border border-cizgi px-5 py-3.5 text-[15px] font-medium"
          >
            {t.ara}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-cizgi bg-kart p-5">
      {/* adım göstergesi */}
      <div className="mb-5 flex items-center gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: n <= adim ? R : "var(--color-cizgi)" }}
          />
        ))}
      </div>

      {/* ——— 1 · hizmet ——— */}
      {adim === 1 && (
        <div className="gir">
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">{t.neYaptiracaksiniz}</h2>
          <p className="mt-1 text-[14.5px] text-silik">{t.birdenFazla}</p>
          <ul className="mt-4 space-y-2">
            {salon.hizmetler.map((h) => {
              const aktif = secili.includes(h.id);
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => hizmetDegistir(h.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors"
                    style={{
                      borderColor: aktif ? R : "var(--color-cizgi)",
                      background: aktif ? "var(--color-yumusak)" : "transparent",
                    }}
                  >
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[12px] font-bold text-white"
                      style={{
                        borderColor: aktif ? R : "var(--color-cizgi)",
                        background: aktif ? R : "transparent",
                      }}
                    >
                      {aktif ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium">{sec(h.ad, h.adEn, dil)}</span>
                      <span className="block text-[13px] text-silik">{sureYazDil(h.dakika, dil)}</span>
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold">
                      {fiyatYazDil(h.fiyat, dil) ?? <span className="text-[13px] font-normal text-silik">—</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Devam
            etiket={t.devam}
            renk={R}
            kapali={secili.length === 0}
            ozet={
              secili.length
                ? `${sureYazDil(toplamDk, dil)}${toplamFiyat ? ` · ${fiyatYazDil(toplamFiyat, dil)}` : ""}`
                : ""
            }
            onClick={() => setAdim(2)}
          />
        </div>
      )}

      {/* ——— 2 · personel ——— */}
      {adim === 2 && (
        <div className="gir">
          <Geri etiket={t.geri} onClick={() => setAdim(1)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">{t.kimdenAlalim}</h2>
          <ul className="mt-4 space-y-2">
            {[{ id: "farketmez", ad: t.farketmez, unvan: t.farketmezAciklama }, ...uygunPersonel].map(
              (p) => {
                const aktif = personel === p.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonel(p.id);
                        setGun("");
                        setSaat("");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left"
                      style={{
                        borderColor: aktif ? R : "var(--color-cizgi)",
                        background: aktif ? "var(--color-yumusak)" : "transparent",
                      }}
                    >
                      {"foto" in p && p.foto ? (
                        <img
                          src={p.foto as string}
                          alt={p.ad}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                          style={{ background: "var(--color-yumusak)" }}
                        />
                      ) : (
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white"
                          style={{ background: p.id === "farketmez" ? "#D8C7CF" : R }}
                        >
                          {p.id === "farketmez" ? "?" : p.ad.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-medium">{p.ad}</span>
                        {"unvan" in p && p.unvan && (
                          <span className="block text-[13px] text-silik">
                            {sec(p.unvan, "unvanEn" in p ? p.unvanEn : undefined, dil)}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              }
            )}
          </ul>
          <Devam etiket={t.devam} renk={R} kapali={false} onClick={() => setAdim(3)} />
        </div>
      )}

      {/* ——— 3 · gün & saat ——— */}
      {adim === 3 && (
        <div className="gir">
          <Geri etiket={t.geri} onClick={() => setAdim(2)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">{t.neZaman}</h2>

          <div className="serit mt-4 flex gap-2 overflow-x-auto pb-1">
            {gunler.map((g) => {
              const aktif = gun === g.anahtar;
              return (
                <button
                  key={g.anahtar}
                  type="button"
                  disabled={g.kapali}
                  onClick={() => setGun(g.anahtar)}
                  className="w-[68px] shrink-0 rounded-2xl border py-2.5 text-center disabled:opacity-35"
                  style={{
                    borderColor: aktif ? R : "var(--color-cizgi)",
                    background: aktif ? R : "transparent",
                    color: aktif ? "#fff" : undefined,
                  }}
                >
                  <div className="text-[12px] opacity-70">{t.gunlerKisa[g.d.getDay()]}</div>
                  <div className="text-[19px] font-semibold leading-tight">{g.d.getDate()}</div>
                  <div className="text-[11px] opacity-70">{t.aylarKisa[g.d.getMonth()]}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 min-h-[120px]">
            {!gun && <p className="text-[14.5px] text-silik">{t.onceGunSecin}</p>}
            {gun && saatler === null && <p className="text-[14.5px] text-silik">Saatler getiriliyor…</p>}
            {gun && saatler && saatler.length === 0 && (
              <p className="text-[14.5px] text-silik">
                Bu gün için uygun saat kalmamış. Başka bir gün seçebilir ya da salonu arayabilirsiniz.
              </p>
            )}
            {gun && saatler && saatler.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {saatler.map((s) => {
                  const aktif = saat === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSaat(s)}
                      className="rounded-xl border py-2.5 text-[15px] font-medium"
                      style={{
                        borderColor: aktif ? R : "var(--color-cizgi)",
                        background: aktif ? R : "transparent",
                        color: aktif ? "#fff" : undefined,
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Devam etiket={t.devam} renk={R} kapali={!saat} onClick={() => setAdim(4)} />
        </div>
      )}

      {/* ——— 4 · bilgiler ——— */}
      {adim === 4 && (
        <div className="gir">
          <Geri etiket={t.geri} onClick={() => setAdim(3)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">{t.sonAdim}</h2>

          <div className="mt-4 rounded-2xl bg-yumusak px-4 py-3.5 text-[14.5px] leading-relaxed">
            <b>{hizmetler.map((h) => sec(h.ad, h.adEn, dil)).join(", ")}</b>
            <br />
            {gun && (
              <>
                {gunYazDil(gun, dil)} · {saat}
              </>
            )}
            <br />
            <span className="text-gri">
              {sureYazDil(toplamDk, dil)}
              {toplamFiyat
                ? ` · ${fiyatYazDil(toplamFiyat, dil)}`
                : ` · ${t.salondaBelirlenir}`}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <Alan etiket={t.adiniz} deger={ad} degistir={setAd} tip="text" ornek="Ayşe Yılmaz" />
            <Alan etiket={t.telefon} deger={tel} degistir={setTel} tip="tel" ornek="05xx xxx xx xx" />
            <Alan etiket={t.notIsteğeBagli} deger={not} degistir={setNot} tip="text" ornek="" />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={onay}
              onChange={(e) => setOnay(e.target.checked)}
              className="mt-0.5 h-[19px] w-[19px] shrink-0"
              style={{ accentColor: R }}
            />
            <span className="text-[13.5px] leading-relaxed text-gri">
              {t.kvkkOnay}{" "}
              <Link
                href={yol(`/${salon.slug}/kvkk`)}
                target="_blank"
                className="font-medium underline underline-offset-2"
                style={{ color: R }}
              >
                {t.aydinlatmaMetni}
              </Link>
            </span>
          </label>

          {hata && <p className="mt-3 text-[14px] text-ana-koyu">{hata}</p>}

          <button
            type="button"
            onClick={gonder}
            disabled={gonderiliyor || !onay}
            className="mt-5 w-full rounded-xl py-4 text-[16px] font-semibold text-white disabled:opacity-60"
            style={{ background: R }}
          >
            {gonderiliyor ? t.gonderiliyor : t.randevuyuTamamla}
          </button>
          <p className="mt-3 text-center text-[12.5px] leading-relaxed text-silik">
            {t.numaraniz}
          </p>
        </div>
      )}
    </div>
  );
}

function Devam({
  etiket,
  renk,
  kapali,
  ozet,
  onClick,
}: {
  etiket: string;
  renk: string;
  kapali: boolean;
  ozet?: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5">
      {ozet && <div className="mb-2 text-center text-[14px] text-gri">{ozet}</div>}
      <button
        type="button"
        onClick={onClick}
        disabled={kapali}
        className="w-full rounded-xl py-4 text-[16px] font-semibold text-white transition-opacity disabled:opacity-35"
        style={{ background: renk }}
      >
        {etiket}
      </button>
    </div>
  );
}

function Geri({ onClick, etiket }: { onClick: () => void; etiket: string }) {
  return (
    <button type="button" onClick={onClick} className="mb-3 text-[14.5px] font-medium text-silik">
      ← {etiket}
    </button>
  );
}

function Alan({
  etiket,
  deger,
  degistir,
  tip,
  ornek,
}: {
  etiket: string;
  deger: string;
  degistir: (v: string) => void;
  tip: string;
  ornek: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gri">{etiket}</span>
      <input
        type={tip}
        value={deger}
        onChange={(e) => degistir(e.target.value)}
        placeholder={ornek}
        inputMode={tip === "tel" ? "tel" : undefined}
        className="w-full rounded-xl border border-cizgi bg-kagit px-4 py-3.5 outline-none placeholder:text-silik focus:border-murekkep"
      />
    </label>
  );
}

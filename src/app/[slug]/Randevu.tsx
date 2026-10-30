"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GUN_ADI, fiyatYaz, sureYaz, type Salon } from "@/lib/salon";
import { ONAY_CUMLESI } from "@/lib/kvkk";

type Adim = 1 | 2 | 3 | 4 | 5;

const AY = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function gunAnahtar(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Randevu({ salon }: { salon: Salon }) {
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
    if (ad.trim().length < 2) return setHata("Adınızı yazar mısınız?");
    const temizTel = tel.replace(/\D/g, "");
    if (temizTel.length < 10) return setHata("Telefon numarası eksik görünüyor.");
    if (!onay) return setHata("Devam etmek için aydınlatma metnini onaylayın.");

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
      setHata("Bağlantı kurulamadı. Tekrar dener misiniz?");
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
        <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">Randevunuz alındı</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-gri">
          {d && (
            <>
              <b className="text-murekkep">
                {d.getDate()} {AY[d.getMonth()]} {GUN_ADI[d.getDay()]}
              </b>{" "}
              saat <b className="text-murekkep">{saat}</b>
            </>
          )}
          <br />
          {hizmetler.map((h) => h.ad).join(", ")}
        </p>
        <p className="mt-4 text-[14px] text-silik">
          Salon onayladığında size haber verilecek.
        </p>

        {sonuc.anahtar && (
          <div className="mt-5 rounded-2xl bg-kagit p-4">
            <p className="text-[13.5px] leading-relaxed text-gri">
              Randevunuzu görüntülemek veya <b className="text-murekkep">iptal etmek</b> için bu
              bağlantıyı saklayın:
            </p>
            <Link
              href={`/${salon.slug}/randevu/${sonuc.id}?k=${sonuc.anahtar}`}
              className="mt-2.5 block rounded-xl py-3 text-center text-[15px] font-semibold text-white"
              style={{ background: salon.koyu }}
            >
              Randevumu görüntüle
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
              {kopyalandi ? "Bağlantı kopyalandı" : "Bağlantıyı kopyala"}
            </button>
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <a
            href={`https://wa.me/${salon.telefon}?text=${encodeURIComponent(
              `Merhaba, ${gun} ${saat} için randevu aldım. (${ad})`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl py-3.5 text-[15px] font-semibold text-white"
            style={{ background: R }}
          >
            WhatsApp'tan yaz
          </a>
          <a
            href={`tel:+${salon.telefon}`}
            className="rounded-xl border border-cizgi px-5 py-3.5 text-[15px] font-medium"
          >
            Ara
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
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Ne yaptıracaksınız?</h2>
          <p className="mt-1 text-[14.5px] text-silik">Birden fazla seçebilirsiniz.</p>
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
                      <span className="block text-[16px] font-medium">{h.ad}</span>
                      <span className="block text-[13px] text-silik">{sureYaz(h.dakika)}</span>
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold">
                      {fiyatYaz(h.fiyat) ?? <span className="text-[13px] font-normal text-silik">—</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Devam
            renk={R}
            kapali={secili.length === 0}
            ozet={secili.length ? `${sureYaz(toplamDk)}${toplamFiyat ? ` · ${fiyatYaz(toplamFiyat)}` : ""}` : ""}
            onClick={() => setAdim(2)}
          />
        </div>
      )}

      {/* ——— 2 · personel ——— */}
      {adim === 2 && (
        <div className="gir">
          <Geri onClick={() => setAdim(1)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Kimden alalım?</h2>
          <ul className="mt-4 space-y-2">
            {[{ id: "farketmez", ad: "Farketmez", unvan: "En uygun saati gösterelim" }, ...uygunPersonel].map(
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
                          <span className="block text-[13px] text-silik">{p.unvan}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              }
            )}
          </ul>
          <Devam renk={R} kapali={false} onClick={() => setAdim(3)} />
        </div>
      )}

      {/* ——— 3 · gün & saat ——— */}
      {adim === 3 && (
        <div className="gir">
          <Geri onClick={() => setAdim(2)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Ne zaman?</h2>

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
                  <div className="text-[12px] opacity-70">{GUN_ADI[g.d.getDay()].slice(0, 3)}</div>
                  <div className="text-[19px] font-semibold leading-tight">{g.d.getDate()}</div>
                  <div className="text-[11px] opacity-70">{AY[g.d.getMonth()]}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 min-h-[120px]">
            {!gun && <p className="text-[14.5px] text-silik">Önce bir gün seçin.</p>}
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

          <Devam renk={R} kapali={!saat} onClick={() => setAdim(4)} />
        </div>
      )}

      {/* ——— 4 · bilgiler ——— */}
      {adim === 4 && (
        <div className="gir">
          <Geri onClick={() => setAdim(3)} />
          <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Son adım</h2>

          <div className="mt-4 rounded-2xl bg-yumusak px-4 py-3.5 text-[14.5px] leading-relaxed">
            <b>{hizmetler.map((h) => h.ad).join(", ")}</b>
            <br />
            {gun && (
              <>
                {new Date(gun).getDate()} {AY[new Date(gun).getMonth()]}{" "}
                {GUN_ADI[new Date(gun).getDay()]} · {saat}
              </>
            )}
            <br />
            <span className="text-gri">
              {sureYaz(toplamDk)}
              {toplamFiyat ? ` · ${fiyatYaz(toplamFiyat)}` : " · fiyat salonda belirlenir"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <Alan etiket="Adınız" deger={ad} degistir={setAd} tip="text" ornek="Ayşe Yılmaz" />
            <Alan etiket="Telefon" deger={tel} degistir={setTel} tip="tel" ornek="05xx xxx xx xx" />
            <Alan etiket="Not (isteğe bağlı)" deger={not} degistir={setNot} tip="text" ornek="Saçım uzun" />
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
              {ONAY_CUMLESI}{" "}
              <Link
                href={`/${salon.slug}/kvkk`}
                target="_blank"
                className="font-medium underline underline-offset-2"
                style={{ color: R }}
              >
                Aydınlatma metni
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
            {gonderiliyor ? "Gönderiliyor…" : "Randevuyu tamamla"}
          </button>
          <p className="mt-3 text-center text-[12.5px] leading-relaxed text-silik">
            Numaranız yalnızca bu randevu için salona iletilir.
          </p>
        </div>
      )}
    </div>
  );
}

function Devam({
  renk,
  kapali,
  ozet,
  onClick,
}: {
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
        Devam
      </button>
    </div>
  );
}

function Geri({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-3 text-[14.5px] font-medium text-silik">
      ← Geri
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

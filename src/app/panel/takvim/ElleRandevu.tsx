"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { Salon } from "@/lib/salon";
import { cumleCoz, eksikler } from "@/lib/sesCoz";
import { elleRandevuEylem } from "../eylemler";
import { simdiTR } from "@/lib/zaman";

/* ───────── tarayıcının ses tanıma arayüzü (tip tanımı) ───────── */

type TanimaOlayi = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
};
type Tanima = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((o: TanimaOlayi) => void) | null;
  onerror: ((o: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type TanimaYapici = new () => Tanima;

function tanimaYapiciAl(): TanimaYapici | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: TanimaYapici;
    webkitSpeechRecognition?: TanimaYapici;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const HATA_METNI: Record<string, string> = {
  "not-allowed": "Mikrofon izni verilmemiş. Tarayıcı ayarlarından bu siteye mikrofon izni verin.",
  "service-not-allowed": "Mikrofon izni verilmemiş. Tarayıcı ayarlarından izin verin.",
  "no-speech": "Ses duyamadım. Tekrar deneyin.",
  "audio-capture": "Mikrofon bulunamadı.",
  network: "Ses tanıma için internet gerekiyor; bağlantı kurulamadı.",
};

/* ───────── bileşen ───────── */

export default function ElleRandevu({ gun, salon }: { gun: string; salon: Salon }) {
  const [acik, setAcik] = useState(false);
  const [durum, gonder, bekliyor] = useActionState(elleRandevuEylem, null);
  const form = useRef<HTMLFormElement>(null);

  // form alanları — mikrofon bunları dolduruyor
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tarih, setTarih] = useState(gun);
  const [saat, setSaat] = useState("");
  const [personel, setPersonel] = useState("farketmez");
  const [secili, setSecili] = useState<string[]>([]);
  const [not, setNot] = useState("");

  // ses
  const [dinliyor, setDinliyor] = useState(false);
  const [cumle, setCumle] = useState("");
  const [sesHatasi, setSesHatasi] = useState<string | null>(null);
  const [anlasilan, setAnlasilan] = useState<string[]>([]);
  const tanima = useRef<Tanima | null>(null);

  /**
   * Ses tanıma desteği yalnız tarayıcıda bilinebiliyor. Çizim sırasında
   * sorulursa sunucu "yok", tarayıcı "var" diyor ve React hidrasyonda
   * uyuşmazlık hatası veriyordu. Bu yüzden ilk çizimde desteksiz
   * sayıp bağlandıktan sonra açıyoruz: sunucu ve tarayıcı aynı HTML'i
   * üretiyor, mikrofon bir an sonra beliriyor.
   */
  const [destekli, setDestekli] = useState(false);
  useEffect(() => setDestekli(tanimaYapiciAl() !== null), []);

  const temizle = () => {
    setAd(""); setTelefon(""); setSaat(""); setPersonel("farketmez");
    setSecili([]); setNot(""); setCumle(""); setAnlasilan([]); setTarih(gun);
  };

  useEffect(() => {
    if (durum === "tamam") {
      form.current?.reset();
      temizle();
      setAcik(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durum]);

  useEffect(() => () => tanima.current?.abort(), []);

  /**
   * Cümleyi alanlara dağıtır.
   *
   * Her çözüm SIFIRDAN yapılır: cümlede geçmeyen alan temizlenir.
   * Aksi hâlde bir önceki cümleden kalan personel veya saat sessizce
   * yeni randevuya yapışıyor.
   */
  const uygula = (metin: string) => {
    setCumle(metin);
    const c = cumleCoz(metin, salon, simdiTR(), gun);
    setAd(c.ad ?? "");
    setTarih(c.gun ?? gun);
    setSaat(c.saat ?? "");
    setPersonel(c.personelId ?? "farketmez");
    setSecili(c.hizmetIds);

    const eksik = eksikler(c);
    setAnlasilan(c.anlasilan);
    setSesHatasi(
      eksik.length ? `Şunu anlayamadım: ${eksik.join(", ")}. Aşağıdan tamamlayın.` : null
    );
    setAcik(true);
  };

  const dinle = () => {
    const Yapici = tanimaYapiciAl();
    if (!Yapici) return;
    if (dinliyor) {
      tanima.current?.stop();
      return;
    }

    setSesHatasi(null);
    setAnlasilan([]);
    const t = new Yapici();
    tanima.current = t;
    t.lang = "tr-TR";
    t.continuous = false;
    t.interimResults = true;
    t.maxAlternatives = 1;

    let sonuc = "";
    /**
     * Güvenlik zamanlayıcısı: mikrofon açılıp hiç ses gelmezse bazı
     * tarayıcılar oturumu kendiliğinden kapatmıyor ve düğme
     * "Dinliyorum" durumunda takılı kalıyor.
     */
    const zamanlayici = setTimeout(() => {
      try {
        t.stop();
      } catch {
        /* zaten kapanmış olabilir */
      }
    }, 8000);

    t.onresult = (o) => {
      let gecici = "";
      for (let i = o.resultIndex; i < o.results.length; i++) {
        const metin = o.results[i][0].transcript;
        if (o.results[i].isFinal) sonuc += metin;
        else gecici += metin;
      }
      setCumle((sonuc + gecici).trim());
    };
    t.onerror = (o) => {
      clearTimeout(zamanlayici);
      setSesHatasi(HATA_METNI[o.error] ?? "Ses alınamadı, tekrar deneyin.");
      setDinliyor(false);
    };
    t.onend = () => {
      clearTimeout(zamanlayici);
      setDinliyor(false);
      const son = sonuc.trim();
      if (son) uygula(son);
      else setSesHatasi("Ses duyamadım. Tekrar deneyin ya da elle yazın.");
    };

    try {
      t.start();
      setDinliyor(true);
    } catch {
      setSesHatasi("Mikrofon başlatılamadı.");
    }
  };

  const toplamDk = salon.hizmetler
    .filter((h) => secili.includes(h.id))
    .reduce((t, h) => t + h.dakika, 0);

  /* ───────── kapalıyken: iki düğme ───────── */

  if (!acik)
    return (
      <div className="space-y-3">
        <button
          onClick={destekli ? dinle : () => setAcik(true)}
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-[16px] font-semibold text-white transition-colors ${
            dinliyor ? "bg-ana-koyu" : "bg-ana"
          }`}
        >
          <MikrofonIkonu calisiyor={dinliyor} />
          {dinliyor ? "Dinliyorum… konuşun" : "Söyleyerek randevu ekle"}
        </button>

        {cumle && !dinliyor && (
          <p className="px-1 text-[14px] text-gri">Duyduğum: “{cumle}”</p>
        )}
        {sesHatasi && (
          <p className="rounded-xl bg-yumusak px-4 py-3 text-[14px] text-ana-koyu" role="alert">
            {sesHatasi}
          </p>
        )}
        {!destekli && (
          <p className="px-1 text-[13px] text-silik">
            Bu tarayıcı sesi tanımıyor — aşağıdan cümleyi yazabilirsiniz.
          </p>
        )}

        <button
          onClick={() => setAcik(true)}
          className="w-full rounded-2xl border border-dashed border-cizgi py-4 text-[15px] font-medium text-ana"
        >
          + Elle ekle
        </button>
      </div>
    );

  /* ───────── açıkken: form ───────── */

  return (
    <form ref={form} action={gonder} className="rounded-3xl border border-cizgi bg-kart p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">Randevu ekle</h3>
        <button type="button" onClick={() => setAcik(false)} className="text-[14px] text-silik">
          Kapat
        </button>
      </div>

      {/* sesle doldurma şeridi */}
      <div className="mb-4 rounded-2xl bg-kagit p-3.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={destekli ? dinle : undefined}
            disabled={!destekli}
            aria-label="Konuşarak doldur"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white disabled:opacity-30 ${
              dinliyor ? "bg-ana-koyu" : "bg-ana"
            }`}
          >
            <MikrofonIkonu calisiyor={dinliyor} />
          </button>
          <input
            value={cumle}
            onChange={(e) => setCumle(e.target.value)}
            onBlur={() => cumle.trim() && uygula(cumle)}
            placeholder={dinliyor ? "Dinliyorum…" : "Ayşe yarın üç buçukta kesim"}
            className="min-w-0 flex-1 rounded-xl border border-cizgi bg-kart px-3.5 py-2.5 text-[15px] outline-none placeholder:text-silik focus:border-ana"
          />
          <button
            type="button"
            onClick={() => cumle.trim() && uygula(cumle)}
            className="shrink-0 rounded-xl border border-cizgi px-3 py-2.5 text-[13.5px] font-medium"
          >
            Çöz
          </button>
        </div>

        {anlasilan.length > 0 && (
          <p className="mt-2.5 text-[13.5px] text-gri">
            Anladığım: <b className="text-murekkep">{anlasilan.join(" · ")}</b> — aşağıdan kontrol
            edin.
          </p>
        )}
        {sesHatasi && (
          <p className="mt-2.5 text-[13.5px] text-ana-koyu" role="alert">
            {sesHatasi}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Alan etiket="Müşteri adı">
          <input
            name="ad"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            required
            placeholder="Ayşe Yılmaz"
            className={girisSinif}
          />
        </Alan>
        <Alan etiket="Telefon">
          <input
            name="telefon"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            className={girisSinif}
          />
        </Alan>
        <Alan etiket="Gün">
          <input
            name="gun"
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className={girisSinif}
          />
        </Alan>
        <Alan etiket="Saat">
          <input
            name="saat"
            type="time"
            step={300}
            value={saat}
            onChange={(e) => setSaat(e.target.value)}
            required
            className={girisSinif}
          />
        </Alan>
      </div>

      <div className="mt-3">
        <Alan etiket="Kim bakacak">
          <select
            name="personel"
            value={personel}
            onChange={(e) => setPersonel(e.target.value)}
            className={girisSinif}
          >
            <option value="farketmez">Farketmez</option>
            {salon.personel.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
              </option>
            ))}
          </select>
        </Alan>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-[13px] font-medium text-gri">
          Hizmetler{toplamDk > 0 ? ` · ${toplamDk} dk` : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          {salon.hizmetler.map((h) => {
            const isaretli = secili.includes(h.id);
            return (
              <label
                key={h.id}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-[14px] ${
                  isaretli ? "border-ana bg-yumusak text-ana-koyu" : "border-cizgi text-gri"
                }`}
              >
                <input
                  type="checkbox"
                  name="hizmet"
                  value={h.id}
                  checked={isaretli}
                  onChange={(e) =>
                    setSecili((o) => (e.target.checked ? [...o, h.id] : o.filter((x) => x !== h.id)))
                  }
                  className="sr-only"
                />
                {h.ad}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Alan etiket="Not (isteğe bağlı)">
          <input
            name="not"
            value={not}
            onChange={(e) => setNot(e.target.value)}
            placeholder="Kısa saç, kahve istemiyor…"
            className={girisSinif}
          />
        </Alan>
      </div>

      {durum && durum !== "tamam" && (
        <p className="mt-3 rounded-xl bg-yumusak px-4 py-3 text-[14px] text-ana-koyu" role="alert">
          {durum}
        </p>
      )}

      <button
        disabled={bekliyor || secili.length === 0}
        className="mt-4 w-full rounded-xl bg-ana py-3.5 text-[15.5px] font-semibold text-white disabled:opacity-40"
      >
        {bekliyor ? "Ekleniyor…" : "Randevuyu ekle"}
      </button>
    </form>
  );
}

/* ───────── küçük parçalar ───────── */

const girisSinif =
  "w-full rounded-xl border border-cizgi bg-kagit px-3.5 py-3 outline-none placeholder:text-silik focus:border-ana";

function Alan({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gri">{etiket}</span>
      {children}
    </label>
  );
}

function MikrofonIkonu({ calisiyor }: { calisiyor: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-[22px] w-[22px] ${calisiyor ? "animate-pulse" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  );
}

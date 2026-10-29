import Link from "next/link";
import { gununRandevulari, kasadaVarMi } from "@/lib/depo";
import { fiyatYaz, sureYaz } from "@/lib/salon";
import { saatYaz } from "@/lib/saat";
import { bugunAnahtar, gunKaydir, gunYaz, telefonYaz, waLink } from "@/lib/bicim";
import Kabuk, { korunanSalon } from "../Kabuk";
import { durumEylem, kasayaYazEylem } from "../eylemler";

export const dynamic = "force-dynamic";

const DURUM_ETIKET: Record<string, { ad: string; sinif: string }> = {
  bekliyor: { ad: "Onay bekliyor", sinif: "bg-yumusak text-ana-koyu" },
  onaylandi: { ad: "Onaylandı", sinif: "bg-[#e8f5ef] text-[#146b48]" },
  geldi: { ad: "Geldi", sinif: "bg-[#eef0f4] text-[#465063]" },
  iptal: { ad: "İptal", sinif: "bg-[#f6f0f1] text-silik" },
};

export default async function Bugun({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const salon = await korunanSalon();
  const sp = await searchParams;
  const gun = /^\d{4}-\d{2}-\d{2}$/.test(sp.g ?? "") ? sp.g! : bugunAnahtar();

  const randevular = await gununRandevulari(salon.slug, gun);
  const aktif = randevular.filter((r) => r.durum !== "iptal");

  const kasaDurum = await Promise.all(aktif.map((r) => kasadaVarMi(salon.slug, r.id)));
  const kasada = new Set(aktif.filter((_, i) => kasaDurum[i]).map((r) => r.id));

  const beklenen = aktif.reduce((t, r) => {
    const h = salon.hizmetler.filter((x) => r.hizmetIds.includes(x.id));
    return t + h.reduce((a, b) => a + (b.fiyat ?? 0), 0);
  }, 0);
  const onayBekleyen = aktif.filter((r) => r.durum === "bekliyor").length;

  return (
    <Kabuk salon={salon} aktif="/panel/bugun" baslik={gun === bugunAnahtar() ? "Bugün" : gunYaz(gun)}>
      {/* gün gezinmesi */}
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/panel/bugun?g=${gunKaydir(gun, -1)}`}
          aria-label="Önceki gün"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cizgi text-gri"
        >
          ‹
        </Link>
        <div className="flex-1 rounded-full border border-cizgi bg-kart px-4 py-2.5 text-center text-[15px] font-medium">
          {gunYaz(gun)}
        </div>
        <Link
          href={`/panel/bugun?g=${gunKaydir(gun, 1)}`}
          aria-label="Sonraki gün"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cizgi text-gri"
        >
          ›
        </Link>
      </div>

      {gun !== bugunAnahtar() && (
        <Link href="/panel/bugun" className="mb-4 inline-block text-[14px] font-medium text-ana">
          ← Bugüne dön
        </Link>
      )}

      {/* özet */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Ozet sayi={String(aktif.length)} etiket="randevu" />
        <Ozet sayi={String(onayBekleyen)} etiket="onay bekliyor" vurgu={onayBekleyen > 0} />
        <Ozet sayi={fiyatYaz(beklenen) ?? "—"} etiket="beklenen ciro" />
      </div>

      {aktif.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-cizgi p-10 text-center">
          <p className="text-[16px] font-medium">Bu güne randevu yok.</p>
          <p className="mt-1.5 text-[14.5px] text-gri">
            Telefonla arayan müşteriyi{" "}
            <Link href={`/panel/takvim?g=${gun}`} className="font-medium text-ana">
              takvimden elle
            </Link>{" "}
            ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {aktif.map((r) => {
            const hizmetler = salon.hizmetler.filter((h) => r.hizmetIds.includes(h.id));
            const tutar = hizmetler.reduce((t, h) => t + (h.fiyat ?? 0), 0);
            const kisi = salon.personel.find((p) => p.id === r.personelId);
            const etiket = DURUM_ETIKET[r.durum];
            const mesaj = `Merhaba ${r.ad}, ${salon.ad}'dan yazıyoruz. ${gunYaz(r.gun)} ${saatYaz(
              r.baslangic
            )} randevunuzu hatırlatmak istedik. Görüşmek üzere!`;

            return (
              <li key={r.id} className="rounded-3xl border border-cizgi bg-kart p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 text-center">
                    <div className="text-[22px] leading-none font-semibold tabular-nums">
                      {saatYaz(r.baslangic)}
                    </div>
                    <div className="mt-1 text-[12px] text-silik">{sureYaz(r.dakika)}</div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[17px] font-semibold">{r.ad}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${etiket.sinif}`}>
                        {etiket.ad}
                      </span>
                      {r.kaynak === "panel" && (
                        <span className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-[11.5px] text-[#465063]">
                          Telefonla
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[14.5px] text-gri">
                      {hizmetler.map((h) => h.ad).join(" · ")}
                      {kisi ? ` — ${kisi.ad}` : ""}
                    </p>
                    {tutar > 0 && (
                      <p className="mt-0.5 text-[14.5px] font-medium">{fiyatYaz(tutar)}</p>
                    )}
                    {r.not && (
                      <p className="mt-2 rounded-xl bg-kagit px-3 py-2 text-[13.5px] text-gri">
                        {r.not}
                      </p>
                    )}
                  </div>
                </div>

                {/* iletişim */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`tel:+${r.telefon}`}
                    className="rounded-full border border-cizgi px-4 py-2.5 text-[14px] font-medium"
                  >
                    {telefonYaz(r.telefon)}
                  </a>
                  <a
                    href={waLink(r.telefon, mesaj)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#25D366]/12 px-4 py-2.5 text-[14px] font-medium text-[#0f7a3d]"
                  >
                    Hatırlatma gönder
                  </a>
                </div>

                {/* durum işlemleri */}
                <div className="mt-2 flex flex-wrap gap-2 border-t border-cizgi pt-3">
                  {r.durum === "bekliyor" && (
                    <DurumDugmesi id={r.id} durum="onaylandi" ad="Onayla" birincil />
                  )}
                  {(r.durum !== "geldi" || kasada.has(r.id)) &&
                    (kasada.has(r.id) ? (
                      <span className="rounded-full bg-kagit px-4 py-2.5 text-[14px] text-silik">
                        Kasaya yazıldı
                      </span>
                    ) : (
                      <form action={kasayaYazEylem}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-full bg-murekkep px-4 py-2.5 text-[14px] font-medium text-white">
                          {tutar > 0 ? `Geldi · kasaya ${fiyatYaz(tutar)}` : "Geldi"}
                        </button>
                      </form>
                    ))}
                  {r.durum !== "iptal" && (
                    <DurumDugmesi id={r.id} durum="iptal" ad="İptal et" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {randevular.length !== aktif.length && (
        <details className="mt-6">
          <summary className="cursor-pointer text-[14px] text-silik">
            İptal edilenler ({randevular.length - aktif.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {randevular
              .filter((r) => r.durum === "iptal")
              .map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-cizgi px-4 py-3 text-[14.5px] text-silik"
                >
                  <span className="tabular-nums">{saatYaz(r.baslangic)}</span>
                  <span className="line-through">{r.ad}</span>
                  <form action={durumEylem} className="ml-auto">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="durum" value="onaylandi" />
                    <button className="text-[13.5px] font-medium text-ana">Geri al</button>
                  </form>
                </li>
              ))}
          </ul>
        </details>
      )}
    </Kabuk>
  );
}

function Ozet({ sayi, etiket, vurgu }: { sayi: string; etiket: string; vurgu?: boolean }) {
  return (
    <div className="rounded-2xl border border-cizgi bg-kart px-4 py-3.5">
      <div className={`text-[20px] font-semibold ${vurgu ? "text-ana" : ""}`}>{sayi}</div>
      <div className="mt-0.5 text-[12.5px] text-silik">{etiket}</div>
    </div>
  );
}

function DurumDugmesi({
  id,
  durum,
  ad,
  birincil,
}: {
  id: string;
  durum: string;
  ad: string;
  birincil?: boolean;
}) {
  return (
    <form action={durumEylem}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="durum" value={durum} />
      <button
        className={`rounded-full px-4 py-2.5 text-[14px] font-medium ${
          birincil ? "bg-ana text-white" : "border border-cizgi text-gri"
        }`}
      >
        {ad}
      </button>
    </form>
  );
}

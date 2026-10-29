import { tumSalonlar } from "@/lib/salon";

export default function Anasayfa() {
  const s = tumSalonlar();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ana text-[22px] font-bold text-white">
        S
      </div>
      <h1 className="mt-6 text-[38px] leading-[1.05] font-semibold tracking-[-0.035em]">
        Randevular artık
        <br />
        DM&rsquo;de değil.
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-gri">
        Salonunuzun kendi randevu sayfası. Müşteriniz saatini kendi seçer, randevu size düşer.
      </p>
      <div className="mt-8 space-y-2">
        {s.map((x) => (
          <a
            key={x.slug}
            href={`/${x.slug}`}
            className="flex items-center justify-between rounded-2xl border border-cizgi bg-kart px-5 py-4"
          >
            <span>
              <span className="block text-[16px] font-medium">{x.ad}</span>
              <span className="block text-[13.5px] text-silik">salonkolay.com/{x.slug}</span>
            </span>
            <span className="text-ana">→</span>
          </a>
        ))}
      </div>
    </main>
  );
}

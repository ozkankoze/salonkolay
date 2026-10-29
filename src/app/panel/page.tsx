import { redirect } from "next/navigation";
import { oturumSlug } from "@/lib/oturum";
import Giris from "./Giris";

export const dynamic = "force-dynamic";

export default async function PanelGiris() {
  if (await oturumSlug()) redirect("/panel/bugun");

  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center px-6 py-12">
      <div className="mb-8">
        <div className="text-[13px] font-semibold tracking-[0.18em] text-ana uppercase">
          Salonkolay
        </div>
        <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-[-0.025em]">
          Salon paneli
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-gri">
          Günün randevuları, takvim, fiyatlar ve kasa — hepsi tek yerde.
        </p>
      </div>

      <div className="rounded-3xl border border-cizgi bg-kart p-6">
        <Giris />
      </div>

      <p className="mt-6 text-center text-[13px] text-silik">
        Şifrenizi bilmiyorsanız salonunuzu kuran kişiye sorun.
      </p>
    </main>
  );
}

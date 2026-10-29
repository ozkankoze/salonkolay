"use client";

import { useActionState } from "react";
import { girisEylem } from "./eylemler";

export default function Giris({ onerilenSlug }: { onerilenSlug?: string }) {
  const [hata, gonder, bekliyor] = useActionState(girisEylem, null);

  return (
    <form action={gonder} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-gri">Salon adresi</span>
        <div className="flex items-center rounded-xl border border-cizgi bg-kagit focus-within:border-ana">
          <span className="pl-4 text-[15px] text-silik">salonkolay.com/</span>
          <input
            name="slug"
            defaultValue={onerilenSlug}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="pinar"
            className="min-w-0 flex-1 bg-transparent py-3.5 pr-4 pl-0.5 outline-none placeholder:text-silik"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-gri">Şifre</span>
        <input
          name="sifre"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-cizgi bg-kagit px-4 py-3.5 outline-none placeholder:text-silik focus:border-ana"
        />
      </label>

      {hata && (
        <p className="rounded-xl bg-yumusak px-4 py-3 text-[14px] text-ana-koyu" role="alert">
          {hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="w-full rounded-xl bg-ana py-4 text-[16px] font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {bekliyor ? "Giriliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}

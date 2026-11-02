"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Kaydırınca beliren sarmalayıcı.
 *
 * Tek bir IntersectionObserver, görününce sınıfı ekliyor ve kendini
 * çözüyor — yani animasyon bir kere oynuyor, aşağı yukarı kaydırdıkça
 * tekrar tekrar değil. Hareket azaltma tercihi açıksa CSS zaten
 * animasyonu kapatıyor.
 */
export default function Belir({
  children,
  gecikme = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** Saniyenin binde biri — komşu kartları sırayla getirmek için. */
  gecikme?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const g = new IntersectionObserver(
      (girisler) => {
        if (girisler[0]?.isIntersecting) {
          setGorundu(true);
          g.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    g.observe(el);
    return () => g.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`p-bel ${gorundu ? "p-gorundu" : ""} ${className}`}
      style={gecikme ? { transitionDelay: `${gecikme}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Salonkolay kelime markası.
 *
 * Kutu içinde "S" yerine makas ucunu andıran bir işaret ve yanında
 * serif kelime markası: platform sayfalarında ürün logosu gibi değil,
 * bir marka gibi dursun diye.
 */
export default function Logo({
  boyut = "normal",
  ton = "koyu",
}: {
  boyut?: "normal" | "buyuk";
  ton?: "koyu" | "acik";
}) {
  const yazi = ton === "acik" ? "text-white" : "text-p-murekkep";
  const isaret = ton === "acik" ? "#ffffff" : "#9b4a5a";

  return (
    <span className="inline-flex items-center gap-2.5 align-middle">
      <svg
        viewBox="0 0 28 28"
        aria-hidden
        className={boyut === "buyuk" ? "h-8 w-8" : "h-7 w-7"}
      >
        <circle cx="14" cy="14" r="13" fill="none" stroke={isaret} strokeWidth="1.4" />
        <path
          d="M9 19.2c2.6-1.6 4.2-3.5 5-5.6.8 2.1 2.4 4 5 5.6M14 13.6V7.4"
          fill="none"
          stroke={isaret}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="21.1" r="1.25" fill={isaret} />
      </svg>
      <span
        className={`p-serif ${yazi} ${
          boyut === "buyuk" ? "text-[26px]" : "text-[21px]"
        } leading-none font-medium tracking-[-0.015em]`}
      >
        salonkolay
      </span>
    </span>
  );
}

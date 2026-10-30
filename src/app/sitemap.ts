import type { MetadataRoute } from "next";
import { siteKoku } from "@/lib/site";
import { tumSalonSluglari } from "@/lib/salonVeri";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const kok = siteKoku();
  const sluglar = await tumSalonSluglari();

  const salonSayfalari = sluglar.flatMap((slug) => [
    {
      url: `${kok}/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${kok}/${slug}/randevu`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  return [
    { url: kok, changeFrequency: "monthly", priority: 1 },
    ...salonSayfalari,
  ];
}

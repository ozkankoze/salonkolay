import type { MetadataRoute } from "next";
import { siteKoku } from "@/lib/site";

/**
 * Salon sayfaları aramaya açık; panel ve API kapalı.
 * Panelin kapalı olması şart — randevu listeleri arama sonuçlarına düşmemeli.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/panel/", "/api/"],
      },
    ],
    sitemap: `${siteKoku()}/sitemap.xml`,
  };
}

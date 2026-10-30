/**
 * Sitenin kendi adresi.
 *
 * Kanonik adres, sitemap ve iptal bağlantıları buna göre üretiliyor.
 * Alan adı alınana kadar Vercel'in verdiği adres kullanılır; SITE_URL
 * tanımlanınca o geçerli olur.
 */
export function siteKoku(): string {
  const elle = process.env.SITE_URL?.trim();
  if (elle) return elle.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

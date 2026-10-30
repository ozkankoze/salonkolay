import { gorselOku } from "@/lib/gorsel";

export const dynamic = "force-dynamic";

/**
 * Yüklenen görselleri servis eder.
 *
 * Adres içeriğe göre sabit olduğundan (her yükleme yeni kimlik alır)
 * önbellek sonsuz verilebiliyor: tarayıcı ve CDN bir kez indiriyor,
 * veritabanına bir daha gidilmiyor.
 */
export async function GET(_istek: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kimlik = id.replace(/\.webp$/i, "");

  if (!/^[a-z0-9]{1,32}$/i.test(kimlik)) {
    return new Response("Geçersiz adres", { status: 400 });
  }

  const veri = await gorselOku(kimlik);
  if (!veri) return new Response("Bulunamadı", { status: 404 });

  return new Response(new Uint8Array(veri), {
    headers: {
      "content-type": "image/webp",
      "content-length": String(veri.length),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

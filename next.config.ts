import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * "pg" yerel bağımlılıklar içerdiği için paketlenmez, Node tarafında
   * doğrudan çalıştırılır. Vercel'de bu olmadan bağlantı hata verebiliyor.
   */
  serverExternalPackages: ["pg"],
};

export default nextConfig;

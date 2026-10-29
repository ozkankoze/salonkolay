/**
 * Panel oturumu.
 *
 * Her salonun kendi slug'ı ve şifresi var. Giriş başarılıysa
 * imzalı bir çerez yazılır; sunucu tarafında her sayfa bu çerezi
 * doğrular. Şifre hiçbir zaman çerezde durmaz.
 */

import { cookies } from "next/headers";
import { jetonCoz, jetonUret, sifreDogruMu, sifreHashle } from "./sifre";
import type { Salon } from "./salon";
import { salonGetir, salonSifreDegistir, salonSifreHash } from "./salonVeri";

const CEREZ = "sk_oturum";

export async function oturumSlug(): Promise<string | null> {
  const kutu = await cookies();
  return jetonCoz(kutu.get(CEREZ)?.value);
}

/** Oturumdaki salon; yoksa null. */
export async function oturumSalonu(): Promise<Salon | null> {
  const slug = await oturumSlug();
  if (!slug) return null;
  return (await salonGetir(slug)) ?? null;
}

export async function girisDene(slug: string, sifre: string): Promise<boolean> {
  const temiz = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!temiz || !sifre) return false;

  const saklanan = await salonSifreHash(temiz);
  if (!saklanan) return false;
  if (!sifreDogruMu(sifre, saklanan)) return false;

  const kutu = await cookies();
  kutu.set(CEREZ, jetonUret(temiz), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return true;
}

export async function cikisYap(): Promise<void> {
  const kutu = await cookies();
  kutu.delete(CEREZ);
}

export async function sifreDegistir(
  slug: string,
  eski: string,
  yeni: string
): Promise<string | null> {
  if (yeni.length < 6) return "Yeni şifre en az 6 karakter olmalı.";
  const saklanan = await salonSifreHash(slug);
  if (!saklanan || !sifreDogruMu(eski, saklanan)) return "Mevcut şifre hatalı.";
  await salonSifreDegistir(slug, sifreHashle(yeni));
  return null;
}

import { cache } from "react";
import { imageUrl } from "./images";
import { getDb } from "./supabase";

export type SiteProfile = {
  nama: string;
  peran: string;
  bio: string;
  kisah: string;
  fotoPath: string | null;
  foto: string | null;
};

const EMPTY: SiteProfile = {
  nama: "",
  peran: "",
  bio: "",
  kisah: "",
  fotoPath: null,
  foto: null,
};

type Row = {
  nama: string | null;
  peran: string | null;
  bio: string | null;
  kisah: string | null;
  foto_path: string | null;
};

export const getSiteProfile = cache(async (): Promise<SiteProfile> => {
  const db = getDb();
  if (!db) return EMPTY;
  const { data, error } = await db
    .from("site_profile")
    .select("nama, peran, bio, kisah, foto_path")
    .eq("id", 1)
    .maybeSingle();
  // Tabel belum dibuat (migrasi belum dijalankan): situs tetap tampil dengan teks bawaan.
  if (error || !data) return EMPTY;
  const r = data as Row;
  return {
    nama: r.nama ?? "",
    peran: r.peran ?? "",
    bio: r.bio ?? "",
    kisah: r.kisah ?? "",
    fotoPath: r.foto_path,
    foto: r.foto_path ? imageUrl(r.foto_path) : null,
  };
});

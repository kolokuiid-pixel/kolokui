export const RUBRIK = {
  senja: {
    nama: "Kolokui Senja",
    label: "Senja",
    judul: "Menutup hari",
    deskripsi:
      "Examen dan seri Yang Baik Dibagikan: kebiasaan rohani sederhana untuk menutup hari.",
  },
  sabda: {
    nama: "Kolokui Sabda",
    label: "Sabda",
    judul: "Kitab Suci",
    deskripsi: "Renungan Kitab Suci dan homili Minggu.",
  },
  omk: {
    nama: "Kolokui OMK",
    label: "OMK",
    judul: "Orang muda",
    deskripsi:
      "Tulisan dan bahan pendampingan orang muda, untuk pendamping maupun OMK sendiri.",
  },
  ziarah: {
    nama: "Kolokui Ziarah",
    label: "Ziarah",
    judul: "Perjalanan",
    deskripsi: "Catatan perjalanan dan perjumpaan.",
  },
} as const;

export type RubrikSlug = keyof typeof RUBRIK;

export const RUBRIK_SLUGS = Object.keys(RUBRIK) as RubrikSlug[];

export function isRubrik(value: string): value is RubrikSlug {
  return value in RUBRIK;
}

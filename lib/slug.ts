/** Judul -> alamat tulisan, contoh "Hari yang Biasa!" -> "hari-yang-biasa". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Dipakai saat mengetik di kolom alamat: tidak memotong "-" di ujung supaya enak diketik. */
export function cleanSlugInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

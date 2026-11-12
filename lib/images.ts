// Aman dipakai di server maupun di browser (hanya membangun alamat publik).

export const IMAGE_BUCKET = "gambar";

export function imageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

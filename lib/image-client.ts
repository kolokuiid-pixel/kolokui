// Hanya untuk dipakai di komponen client (memakai canvas dan API browser).

import { createClient } from "@supabase/supabase-js";
import { createImageUploadUrl } from "@/app/admin/actions";
import { IMAGE_BUCKET } from "./images";

const MAX_SIDE = 1600;

/** Mengecilkan foto (sisi terpanjang 1600 px) dan mengubahnya ke JPEG supaya ringan. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Pakai foto berformat JPG, PNG, atau WebP.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Foto ini tidak bisa dibuka. Coba simpan ulang sebagai JPG.");
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak bisa memproses foto.");
  ctx.fillStyle = "#ffffff"; // PNG transparan jadi berlatar putih
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Gagal memproses foto.");
  return blob;
}

/** Kecilkan, unggah ke Supabase, kembalikan lokasi file di bucket. */
export async function uploadImage(file: File): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur.",
    );
  }

  const blob = await shrink(file);
  const ticket = await createImageUploadUrl();
  if ("error" in ticket) throw new Error(ticket.error);

  const sb = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await sb.storage
    .from(IMAGE_BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, blob, {
      contentType: "image/jpeg",
    });
  if (error) throw new Error(`Upload foto gagal: ${error.message}`);
  return ticket.path;
}

# Kolokui

Website renungan: Percakapan dengan Tuhan, sesama, dan hidup.
Next.js (App Router) + Supabase (database dan file Pustaka). Siap deploy ke Vercel.

## Setup sekali jalan

1. **Supabase**: buat project di supabase.com (region Singapore paling dekat).
   Buka **SQL Editor > New query**, tempel isi `supabase/schema.sql`, klik **Run**.
   Ini membuat tabel `posts`, `pustaka`, dan bucket file `pustaka` dan `gambar`.
   (Kalau `schema.sql` sudah pernah dijalankan sebelum fitur foto ada, jalankan `supabase/migrasi-foto.sql` saja.)
2. **Ambil kunci** di **Project Settings > API**: Project URL, kunci `anon`/`publishable`, dan kunci `service_role`/`secret`.
3. **Buat `.env.local`** (contoh ada di `.env.example`):

   | Variabel | Isi |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | kunci anon / publishable |
   | `SUPABASE_SERVICE_ROLE_KEY` | kunci service_role / secret. **Rahasia**, jangan dibagikan |
   | `ADMIN_PASSWORD` | password login admin |
   | `ADMIN_SESSION_SECRET` | teks acak, min. 16 karakter. `openssl rand -hex 32` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | tujuan formulir Ajak Bercakap |

4. Jalankan:

   ```bash
   npm install
   npm run dev     # http://localhost:3000
   ```

5. Buka `/admin`, masuk dengan `ADMIN_PASSWORD`.

## Deploy ke Vercel

Isi **semua variabel yang sama** di Vercel > Project > Settings > Environment Variables, lalu deploy ulang.
Tulisan yang diterbitkan dari admin langsung muncul di situs (maksimal sekitar satu menit).

## Memakai admin

- **Tulisan**: daftar semua tulisan (terbit dan draf). "Tulisan baru" membuka editor.
  Isi ditulis dengan Markdown sederhana: baris kosong = paragraf baru, `## Subjudul`, `> kutipan ayat`, `**tebal**`, `*miring*`.
  Tombol **Pratinjau** menampilkan tampilan akhirnya. **Simpan sebagai draf** tidak tampil di situs.
  Foto itu opsional: **Foto sampul** tampil di atas tulisan dan di daftar tulisan, sedangkan **Sisipkan foto** menaruh foto di dalam isi tulisan.
  Foto dikecilkan otomatis (sisi terpanjang 1600 px) sebelum diunggah. Format: JPG, PNG, WebP.
- **Pustaka**: tambah bahan (judul, jenis, tahun, file PDF/Word/PowerPoint/Excel/ZIP). File boleh dikosongkan, di situs tampil "Segera tersedia".
  Untuk mengganti file, hapus bahan lalu tambah lagi.

## Keamanan

- Login memakai password (ADMIN_PASSWORD atau ROMO_PASSWORD) dan cookie bertanda tangan (HttpOnly, berlaku 7 hari).
- Tabel database tidak bisa diakses langsung dari browser (RLS aktif tanpa policy). Semua baca-tulis lewat server.
- Belum ada pembatasan percobaan login selain jeda kecil saat salah. Pakai password yang panjang.

## Catatan

Folder `content/` dan paket `gray-matter` dari versi awal sudah tidak dipakai. Folder `content/` boleh dihapus.

## Login pengunjung, komentar, dan pesan ke Romo

Fitur ini butuh tiga hal di luar kode. Tanpa ini situs tetap jalan, hanya fitur login/komentar/pesan yang belum aktif.

### 1. Database
Buka Supabase > SQL Editor, tempel isi `supabase/migrasi-komunitas.sql`, klik Run. Aman dijalankan ulang.

### 2. Dua password admin
Di `.env.local` (dan di Vercel):
- `ADMIN_PASSWORD`: untuk pengelola. Bisa mengurus tulisan, Pustaka, profil, dan komentar. **Tidak bisa** membuka pesan.
- `ROMO_PASSWORD`: untuk Romo. Semua yang di atas, plus kotak pesan. Romo sebaiknya memilih dan menyimpan sendiri password ini, berbeda dari ADMIN_PASSWORD.

Keduanya masuk lewat halaman /admin/login yang sama; peran ditentukan oleh password yang dipakai.

### 3. Login di Supabase (Authentication)
1. **URL Configuration**: Site URL = alamat situs. Redirect URLs: tambahkan `http://localhost:3000/**`, `https://*.app.github.dev/**`, dan alamat produksi `/**`.
2. **Email templates** > ubah template *Magic Link* (dan *Confirm signup*) supaya tautannya:
   `<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Masuk ke Kolokui</a>`
   Ini penting supaya tautan email tetap jalan walau dibuka di aplikasi lain di HP.
3. **Providers > Google**: buat OAuth client di Google Cloud Console (Web application). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`. Salin Client ID dan Secret ke Supabase, aktifkan.
4. **SMTP**: Supabase bawaan hanya mengirim beberapa email per jam. Pakai SMTP sendiri (misalnya Resend) di Authentication > SMTP Settings.

### 4. Pemberitahuan email (opsional)
Isi `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `ROMO_NOTIFY_EMAIL`, dan `NEXT_PUBLIC_SITE_URL`. Romo dapat email saat ada pesan baru, pengunjung dapat email saat Romo membalas. Email tidak memuat isi pesan, hanya tautan.

### Batas dan privasi
- Komentar langsung tampil. Pengelola bisa menyembunyikan, menghapus, atau memblokir di /admin/komentar.
- Batas kirim: 5 komentar per 10 menit, 20 pesan per jam per pengunjung.
- "Hanya Romo" berlaku di dalam aplikasi: pengelola situs tidak bisa membuka pesan. Tetapi pemilik proyek Supabase tetap bisa melihat tabel `messages` lewat dashboard Supabase. Kalau privasi harus ketat, jadikan Romo pemilik proyek Supabase-nya.
- Halaman /pesan, /akun, /masuk tidak diindeks Google.

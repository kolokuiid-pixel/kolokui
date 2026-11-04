# Kolokui

Website renungan: Percakapan dengan Tuhan, sesama, dan hidup.
Next.js (App Router) + tulisan dalam file Markdown. Siap deploy ke Vercel.

## Jalankan

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # cek sebelum deploy
```

## Menambah tulisan

Taruh file `.md` di folder rubrik yang sesuai: `content/senja`, `content/sabda`, `content/omk`, `content/ziarah`.
Nama file jadi alamat tulisan (`contoh-renungan.md` menjadi `/tulisan/sabda/contoh-renungan`).

```md
---
title: "Judul tulisan"
date: "2026-11-04"
ringkasan: "Satu-dua kalimat yang muncul di daftar tulisan."
---

Isi tulisan dengan format Markdown biasa.
```

Hapus file `contoh-*.md` kalau tulisan asli sudah ada.

## Pustaka

Edit `content/pustaka.json`. Taruh file unduhan di folder `public/pustaka/`, lalu isi `"file": "/pustaka/nama-file.pdf"`.
Kalau `file` diisi `null`, tampil "Segera tersedia".

## Formulir Ajak Bercakap

Saat ini formulir membuka aplikasi email dengan pesan yang sudah terisi.
Buat file `.env.local` berisi:

```
NEXT_PUBLIC_CONTACT_EMAIL=alamat@email.com
```

Di Vercel, isi variabel yang sama di Project Settings > Environment Variables.

## Yang masih placeholder

Foto Romo, nama lengkap dan profil di halaman Tentang, kisah di balik nama Kolokui.

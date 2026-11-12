-- Jalankan sekali di Supabase > SQL Editor > New query > Run.
-- Menambah penanda "Pilihan" (tampil di bagian atas Beranda, maksimal 3 tulisan).
alter table public.posts add column if not exists featured boolean not null default false;

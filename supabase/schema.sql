-- Kolokui: jalankan SEKALI di Supabase > SQL Editor > New query > Run.
-- (Kalau bagian ini sudah pernah dijalankan sebelum fitur foto, pakai migrasi-foto.sql saja.)

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  rubrik text not null check (rubrik in ('senja', 'sabda', 'omk', 'ziarah')),
  slug text not null,
  title text not null,
  date date not null default current_date,
  ringkasan text not null default '',
  body text not null default '',
  published boolean not null default false,
  cover_path text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rubrik, slug)
);

create index if not exists posts_published_date_idx
  on public.posts (published, date desc);

create table if not exists public.pustaka (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  jenis text not null,
  tahun text not null default '',
  file_path text,
  created_at timestamptz not null default now()
);

-- RLS aktif TANPA policy: kunci publik (anon) tidak bisa membaca atau menulis tabel.
-- Semua akses lewat server Next.js memakai service role key, jadi draf tidak pernah bocor.
alter table public.posts enable row level security;
alter table public.pustaka enable row level security;

-- Bucket file Pustaka. Publik untuk diunduh; upload hanya lewat tautan bertanda tangan dari admin.
insert into storage.buckets (id, name, public)
values ('pustaka', 'pustaka', true)
on conflict (id) do nothing;

-- Bucket foto tulisan. Hanya gambar, maksimal 5 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gambar', 'gambar', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ===== Komunitas: profil, login pengunjung, komentar, pesan =====
-- Fitur komunitas: profil Romo yang bisa diubah, login pengunjung, komentar, dan pesan ke Romo.
-- Jalankan sekali di Supabase > SQL Editor > New query > Run.
-- (Aman dijalankan ulang. Kalau kamu memulai dari nol, bagian ini sudah ikut ada di schema.sql.)

-- Profil Romo (satu baris saja)
create table if not exists public.site_profile (
  id int primary key default 1 check (id = 1),
  nama text not null default '',
  peran text not null default '',
  bio text not null default '',
  kisah text not null default '',
  foto_path text,
  updated_at timestamptz not null default now()
);
insert into public.site_profile (id) values (1) on conflict (id) do nothing;

-- Nama tampilan pengunjung + penanda diblokir
create table if not exists public.visitor_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Komentar di bawah tulisan
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 2000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists comments_user_idx on public.comments (user_id, created_at);

-- Pesan pribadi: satu percakapan per pengunjung
create table if not exists public.conversations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  last_user_message_at timestamptz,
  last_romo_message_at timestamptz,
  romo_read_at timestamptz,
  user_read_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.conversations (user_id) on delete cascade,
  sender text not null check (sender in ('user', 'romo')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists messages_user_idx on public.messages (user_id, created_at);

-- RLS aktif TANPA policy: browser tidak bisa menyentuh tabel-tabel ini langsung.
-- Semua akses lewat server Next.js (service role) yang memeriksa siapa yang bertanya.
alter table public.site_profile enable row level security;
alter table public.visitor_profiles enable row level security;
alter table public.comments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

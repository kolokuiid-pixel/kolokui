-- Khusus kalau schema.sql SUDAH pernah dijalankan sebelum fitur foto ada.
-- Jalankan sekali di Supabase > SQL Editor > New query > Run.

alter table public.posts add column if not exists cover_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gambar', 'gambar', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

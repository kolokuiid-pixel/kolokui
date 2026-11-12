"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { previewMarkdown, savePost } from "@/app/admin/actions";
import { uploadImage } from "@/lib/image-client";
import { imageUrl } from "@/lib/images";
import type { PostFull } from "@/lib/posts";
import { RUBRIK, RUBRIK_SLUGS, type RubrikSlug } from "@/lib/rubrik";
import { cleanSlugInput, slugify } from "@/lib/slug";

type Props = { initial?: PostFull; defaultDate: string };

export default function PostForm({ initial, defaultDate }: Props) {
  const isEdit = Boolean(initial);
  const wasPublished = initial?.published ?? false;
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [rubrik, setRubrik] = useState<RubrikSlug>(initial?.rubrik ?? "sabda");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // Tulisan yang sudah ada: alamat tidak berubah otomatis supaya tautan lama tetap jalan.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [ringkasan, setRingkasan] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverPath, setCoverPath] = useState<string | null>(
    initial?.coverPath ?? null,
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [busyImage, setBusyImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [previewing, startPreview] = useTransition();

  function submit(intent: "publish" | "draft") {
    if (!formRef.current?.reportValidity()) return;
    setError(null);
    const fd = new FormData();
    if (initial) fd.set("id", initial.id);
    fd.set("rubrik", rubrik);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("date", date);
    fd.set("ringkasan", ringkasan);
    fd.set("body", body);
    fd.set("cover", coverPath ?? "");
    fd.set("featured", featured ? "1" : "0");
    fd.set("intent", intent);
    startSave(async () => {
      const res = await savePost(fd); // sukses = berpindah ke daftar tulisan
      if (res?.error) setError(res.error);
    });
  }

  function togglePreview() {
    if (previewHtml !== null) {
      setPreviewHtml(null);
      return;
    }
    startPreview(async () => {
      setPreviewHtml(await previewMarkdown(body));
    });
  }

  async function pickCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya foto yang sama bisa dipilih ulang
    if (!file) return;
    setError(null);
    setBusyImage(true);
    try {
      setCoverPath(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setBusyImage(false);
    }
  }

  async function insertPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusyImage(true);
    try {
      const path = await uploadImage(file);
      const md = `\n\n![Keterangan foto](${imageUrl(path)})\n\n`;
      const ta = bodyRef.current;
      const start = ta?.selectionStart ?? body.length;
      const end = ta?.selectionEnd ?? start;
      setBody(body.slice(0, start) + md + body.slice(end));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setBusyImage(false);
    }
  }

  const disabled = saving || busyImage;

  return (
    <form
      ref={formRef}
      className="editor"
      // Enter di kolom teks tidak boleh menerbitkan tulisan tanpa sengaja.
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="field">
        <label htmlFor="title">Judul</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="rubrik">Rubrik</label>
          <select
            id="rubrik"
            value={rubrik}
            onChange={(e) => setRubrik(e.target.value as RubrikSlug)}
          >
            {RUBRIK_SLUGS.map((s) => (
              <option key={s} value={s}>
                {RUBRIK[s].nama}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Tanggal</label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="slug">Alamat tulisan</label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(cleanSlugInput(e.target.value));
          }}
          aria-describedby="slug-note"
        />
        <span className="note" id="slug-note">
          Muncul di alamat: /tulisan/{rubrik}/{slug || "..."}
        </span>
      </div>

      <div className="field">
        <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            style={{ width: "auto" }}
          />
          Jadikan Pilihan di Beranda (opsional, maksimal 3 tulisan)
        </label>
        <span className="note">Hanya berlaku kalau tulisan diterbitkan, bukan disimpan sebagai draf.</span>
      </div>

      <div className="field">
        <label htmlFor="ringkasan">Ringkasan (tampil di daftar tulisan)</label>
        <input
          id="ringkasan"
          value={ringkasan}
          onChange={(e) => setRingkasan(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="cover">Foto sampul (opsional)</label>
        {coverPath ? (
          <div className="cover-row">
            <img
              src={imageUrl(coverPath)}
              alt="Foto sampul tulisan ini"
              className="cover-preview"
            />
            <button
              type="button"
              className="link-danger"
              onClick={() => setCoverPath(null)}
            >
              Hapus foto sampul
            </button>
          </div>
        ) : null}
        <input
          id="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={pickCover}
          disabled={busyImage}
          aria-describedby="cover-note"
        />
        <span className="note" id="cover-note">
          {busyImage
            ? "Mengunggah foto..."
            : coverPath
              ? "Pilih foto lain kalau mau mengganti."
              : "JPG, PNG, atau WebP. Ukurannya dikecilkan otomatis."}
        </span>
      </div>

      <div className="field">
        <label htmlFor="body">Isi tulisan</label>
        <textarea
          id="body"
          ref={bodyRef}
          className="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-describedby="body-note"
        />
        <span className="note" id="body-note">
          Tips: baris kosong = paragraf baru. “## Subjudul”, “&gt; kutipan ayat”,
          “**tebal**”, “*miring*”.
        </span>
      </div>

      <div className="field">
        <label htmlFor="inline-photo">Sisipkan foto ke dalam tulisan (opsional)</label>
        <input
          id="inline-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={insertPhoto}
          disabled={busyImage}
          aria-describedby="inline-note"
        />
        <span className="note" id="inline-note">
          Foto muncul di posisi kursor pada isi tulisan sebagai baris
          “![Keterangan foto](...)”. Ganti “Keterangan foto” dengan deskripsi singkat.
        </span>
      </div>

      {previewHtml !== null ? (
        <div className="preview">
          <div className="prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      ) : null}

      {error ? (
        <p className="flash flash-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="btn"
          disabled={disabled}
          onClick={() => submit("publish")}
        >
          {saving ? "Menyimpan..." : wasPublished ? "Simpan perubahan" : "Terbitkan"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={disabled}
          onClick={() => submit("draft")}
        >
          {wasPublished ? "Tarik jadi draf" : "Simpan sebagai draf"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={previewing}
          onClick={togglePreview}
        >
          {previewHtml !== null ? "Sembunyikan pratinjau" : previewing ? "Memuat..." : "Pratinjau"}
        </button>
      </div>
    </form>
  );
}

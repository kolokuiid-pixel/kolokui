"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { saveProfil } from "@/app/admin/actions-komunitas";
import { uploadImage } from "@/lib/image-client";
import { imageUrl } from "@/lib/images";

type Initial = { nama: string; peran: string; bio: string; kisah: string; fotoPath: string | null };

export default function ProfilForm({ initial }: { initial: Initial }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(initial);
  const [busyImage, setBusyImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const set = (k: keyof Initial) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDone(false);
    setV((p) => ({ ...p, [k]: e.target.value }));
  };

  async function pickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setDone(false);
    setBusyImage(true);
    try {
      const path = await uploadImage(file);
      setV((p) => ({ ...p, fotoPath: path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setBusyImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    start(async () => {
      const res = await saveProfil(v);
      if (res.error) setError(res.error);
      else setDone(true);
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="field">
        <label htmlFor="foto">Foto Romo</label>
        {v.fotoPath ? (
          <div className="cover-row">
            <img src={imageUrl(v.fotoPath)} alt="Foto Romo saat ini" className="cover-preview" />
            <button
              type="button"
              className="link-btn"
              onClick={() => setV((p) => ({ ...p, fotoPath: null }))}
            >
              Hapus foto
            </button>
          </div>
        ) : null}
        <input id="foto" type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} disabled={busyImage} />
        <span className="note">{busyImage ? "Mengunggah..." : "JPG, PNG, atau WebP. Otomatis dikecilkan."}</span>
      </div>
      <div className="field">
        <label htmlFor="nama">Nama</label>
        <input id="nama" value={v.nama} onChange={set("nama")} maxLength={120} placeholder="Romo ..." />
      </div>
      <div className="field">
        <label htmlFor="peran">Keterangan singkat (tampil di Beranda)</label>
        <input id="peran" value={v.peran} onChange={set("peran")} maxLength={300} />
      </div>
      <div className="field">
        <label htmlFor="bio">Profil</label>
        <textarea id="bio" value={v.bio} onChange={set("bio")} style={{ minHeight: 180 }} />
        <span className="note">Boleh pakai Markdown: **tebal**, *miring*, baris kosong untuk paragraf baru.</span>
      </div>
      <div className="field">
        <label htmlFor="kisah">Kisah di balik nama Kolokui</label>
        <textarea id="kisah" value={v.kisah} onChange={set("kisah")} style={{ minHeight: 220 }} />
      </div>
      {error ? <p className="flash flash-error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      {done ? <p className="flash" role="status" style={{ margin: 0 }}>Profil tersimpan.</p> : null}
      <div>
        <button type="submit" className="btn" disabled={pending || busyImage}>
          {pending ? "Menyimpan..." : "Simpan profil"}
        </button>
      </div>
    </form>
  );
}

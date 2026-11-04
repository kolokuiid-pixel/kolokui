"use client";

import { FormEvent } from "react";

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export default function UndanganForm() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Undangan ${f.get("jenis")} dari ${f.get("nama")}`;
    const body = [
      `Nama: ${f.get("nama")}`,
      `Kontak: ${f.get("kontak")}`,
      `Paroki / komunitas: ${f.get("asal")}`,
      `Jenis acara: ${f.get("jenis")}`,
      `Perkiraan tanggal: ${f.get("tanggal")}`,
      "",
      String(f.get("pesan") ?? ""),
    ].join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="nama">Nama</label>
        <input id="nama" name="nama" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="kontak">Email atau nomor WhatsApp</label>
        <input id="kontak" name="kontak" required />
      </div>
      <div className="field">
        <label htmlFor="asal">Paroki atau komunitas</label>
        <input id="asal" name="asal" />
      </div>
      <div className="field">
        <label htmlFor="jenis">Jenis acara</label>
        <select id="jenis" name="jenis" defaultValue="Rekoleksi">
          <option>Rekoleksi</option>
          <option>Retret</option>
          <option>Narasumber</option>
          <option>Lainnya</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="tanggal">Perkiraan tanggal</label>
        <input id="tanggal" name="tanggal" />
      </div>
      <div className="field">
        <label htmlFor="pesan">Cerita singkat tentang acaranya</label>
        <textarea id="pesan" name="pesan" required />
      </div>
      <div>
        <button type="submit" className="btn">
          Kirim lewat email
        </button>
      </div>
      <p className="note">
        {EMAIL
          ? "Tombol ini membuka aplikasi email dengan pesan yang sudah terisi."
          : "Alamat email tujuan belum diatur. Isi NEXT_PUBLIC_CONTACT_EMAIL di file .env.local."}
      </p>
    </form>
  );
}

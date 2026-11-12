"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { createUploadUrl, savePustaka } from "@/app/admin/actions";

const JENIS = ["Makalah", "Rekoleksi", "Presentasi", "Lainnya"];
const BUCKET = "pustaka"; // harus sama dengan PUSTAKA_BUCKET di lib/supabase.ts

export default function PustakaForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [judul, setJudul] = useState("");
  const [jenis, setJenis] = useState(JENIS[0]);
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const file = fileRef.current?.files?.[0] ?? null;

    start(async () => {
      let filePath: string | null = null;

      if (file) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !anon) {
          setError("NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur.");
          return;
        }
        const ticket = await createUploadUrl(file.name);
        if ("error" in ticket) {
          setError(ticket.error);
          return;
        }
        const sb = createClient(url, anon, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error: upErr } = await sb.storage
          .from(BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, file);
        if (upErr) {
          setError(`Upload gagal: ${upErr.message}`);
          return;
        }
        filePath = ticket.path;
      }

      const res = await savePustaka({ judul, jenis, tahun, filePath });
      if (res.error) {
        setError(res.error);
        return;
      }
      setJudul("");
      if (fileRef.current) fileRef.current.value = "";
      setDone(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div className="field">
        <label htmlFor="judul">Judul</label>
        <input
          id="judul"
          required
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
        />
      </div>
      <div className="row2" style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label htmlFor="jenis">Jenis</label>
          <select id="jenis" value={jenis} onChange={(e) => setJenis(e.target.value)}>
            {JENIS.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: "1 1 120px" }}>
          <label htmlFor="tahun">Tahun</label>
          <input id="tahun" value={tahun} onChange={(e) => setTahun(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="file">File (boleh dikosongkan, tampil “Segera tersedia”)</label>
        <input
          id="file"
          type="file"
          ref={fileRef}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
        />
        <span className="note">PDF, Word, PowerPoint, Excel, atau ZIP. Maksimal 50 MB.</span>
      </div>
      {error ? (
        <p className="flash flash-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="flash" role="status" style={{ margin: 0 }}>
          Tersimpan di Pustaka.
        </p>
      ) : null}
      <div>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Mengunggah..." : "Tambah ke Pustaka"}
        </button>
      </div>
    </form>
  );
}

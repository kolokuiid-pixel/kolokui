"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { kirimBalasan } from "@/app/admin/actions-komunitas";

export default function BalasForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await kirimBalasan({ userId, body: text });
      if (res.error) {
        setError(res.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
      <div className="field">
        <label htmlFor="balas">Balasan</label>
        <textarea id="balas" required value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} style={{ minHeight: 120 }} />
      </div>
      {error ? <p className="flash flash-error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <div>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Mengirim..." : "Kirim balasan"}
        </button>
      </div>
    </form>
  );
}

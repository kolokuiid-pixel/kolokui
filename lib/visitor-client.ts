// Dipakai di komponen client: status login pengunjung dan fetch yang menyertakan token sesi.

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getBrowserClient } from "./supabase-browser";

export type VisitorState = {
  loading: boolean;
  user: User | null;
  configured: boolean;
};

export function useVisitor(): VisitorState {
  const [state, setState] = useState<VisitorState>({
    loading: true,
    user: null,
    configured: true,
  });

  useEffect(() => {
    const sb = getBrowserClient();
    if (!sb) {
      setState({ loading: false, user: null, configured: false });
      return;
    }
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (alive) setState({ loading: false, user: data.session?.user ?? null, configured: true });
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (alive) setState({ loading: false, user: session?.user ?? null, configured: true });
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** fetch yang menambahkan token login terbaru (token diperbarui otomatis kalau hampir habis). */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const sb = getBrowserClient();
  if (sb) {
    const { data } = await sb.auth.getSession();
    if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  return fetch(input, { ...init, headers, cache: "no-store" });
}

/** Hanya izinkan alamat di situs ini, supaya tautan login tidak bisa dipakai untuk mengalihkan ke situs lain. */
export function safeNext(value: string | null | undefined, fallback = "/akun"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export const NEXT_KEY = "kolokui_next";

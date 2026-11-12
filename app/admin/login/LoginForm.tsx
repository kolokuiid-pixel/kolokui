"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: null });

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
        />
      </div>
      {state.error ? (
        <p className="flash flash-error" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      <div>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Memeriksa..." : "Masuk"}
        </button>
      </div>
    </form>
  );
}

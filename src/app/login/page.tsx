"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Login fehlgeschlagen");
      return;
    }
    // Full reload: Session-Cookie und Account-Daten sicher neu laden
    // (wichtig beim Wechsel Produktionsleiter ↔ Einkauf).
    window.location.assign("/account");
  }

  return (
    <div className="section" style={{ maxWidth: 480 }}>
      <header className="page-intro" style={{ padding: 0 }}>
        <p className="eyebrow">B2B</p>
        <h1>Anmelden</h1>
        <p className="muted">Zugang für freigeschaltete Firmenkunden.</p>
      </header>
      <form className="panel form-grid" onSubmit={onSubmit} style={{ marginTop: "1.5rem" }}>
        <label>
          E-Mail
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label>
          Passwort
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn btn--primary" disabled={loading}>
          {loading ? "…" : "Anmelden"}
        </button>
        <p className="muted">
          Neu? <Link href="/register">Firma registrieren</Link>
        </p>
      </form>
    </div>
  );
}

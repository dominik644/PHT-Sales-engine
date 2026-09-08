"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    const payload = {
      companyName: String(fd.get("companyName") ?? ""),
      vatId: String(fd.get("vatId") ?? "") || null,
      billingEmail: String(fd.get("billingEmail") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      postal: String(fd.get("postal") ?? ""),
      country: "DE",
      adminName: String(fd.get("adminName") ?? ""),
      adminEmail: String(fd.get("adminEmail") ?? ""),
      password: String(fd.get("password") ?? ""),
      role: String(fd.get("role") ?? "COMPANY_ADMIN"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; message?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Registrierung fehlgeschlagen");
      return;
    }
    router.push("/account?registered=1");
    router.refresh();
  }

  return (
    <div className="section" style={{ maxWidth: 720 }}>
      <header className="page-intro" style={{ padding: 0 }}>
        <p className="eyebrow">B2B</p>
        <h1>Firma registrieren</h1>
        <p className="muted">
          Zugang für Einkauf und Produktionsleiter. Nach der Registrierung
          schaltet PHT die Firma frei.
        </p>
      </header>

      <form className="panel form-grid" onSubmit={onSubmit} style={{ marginTop: "1.5rem" }}>
        <h2>Firma</h2>
        <label>
          Firmenname
          <input name="companyName" required />
        </label>
        <label>
          USt-IdNr. (optional)
          <input name="vatId" />
        </label>
        <label>
          Rechnungs-E-Mail
          <input name="billingEmail" type="email" required />
        </label>
        <label>
          Adresse
          <input name="address" required />
        </label>
        <label>
          Stadt
          <input name="city" required />
        </label>
        <label>
          PLZ
          <input name="postal" required />
        </label>

        <h2>Ihr Zugang</h2>
        <label>
          Name
          <input name="adminName" required />
        </label>
        <label>
          E-Mail
          <input name="adminEmail" type="email" required />
        </label>
        <label>
          Passwort (min. 8 Zeichen)
          <input name="password" type="password" minLength={8} required />
        </label>
        <label>
          Rolle
          <select name="role" defaultValue="COMPANY_ADMIN">
            <option value="COMPANY_ADMIN">Firmen-Admin</option>
            <option value="PURCHASING">Einkauf</option>
            <option value="PRODUCTION_MANAGER">Produktionsleiter</option>
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn btn--primary" disabled={loading}>
          {loading ? "Wird registriert…" : "Registrieren"}
        </button>
        <p className="muted">
          Bereits Kunde? <Link href="/login">Anmelden</Link>
        </p>
      </form>
    </div>
  );
}

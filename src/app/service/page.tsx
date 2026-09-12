"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Me = { name: string; companyName: string } | null;
type ProductOption = { id: string; name: string; sku: string };

export default function ServicePage() {
  const [me, setMe] = useState<Me>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [type, setType] = useState<"montage" | "wartung" | "service">("montage");
  const [preferredDate, setPreferredDate] = useState("");
  const [productId, setProductId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => setMe(d.user));
    void fetch("/api/products")
      .then((r) => r.json())
      .then((d: { products: ProductOption[] }) => setProducts(d.products ?? []));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!me) {
      setError("Bitte zuerst anmelden.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const preferredIso = preferredDate
        ? new Date(`${preferredDate}T09:00:00`).toISOString()
        : null;
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          preferredDate: preferredIso,
          productId: productId || null,
          note,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        serviceRequest?: { number: string };
      };
      if (!res.ok || !data.serviceRequest) {
        setError(data.error ?? "Anfrage fehlgeschlagen.");
        return;
      }
      setSuccess(
        `Serviceanfrage ${data.serviceRequest.number} wurde übermittelt.`,
      );
      setNote("");
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <div className="section__head">
        <div>
          <p className="eyebrow">Service</p>
          <h1>Montage & Wartung</h1>
          <p className="muted">
            Fordern Sie Montage, Wartung oder einen allgemeinen Serviceeinsatz
            mit Wunschtermin an.
          </p>
        </div>
      </div>

      {!me ? (
        <div className="panel store-panel">
          <h2>Anmeldung erforderlich</h2>
          <p className="muted">Serviceanfragen sind nur für B2B-Kunden möglich.</p>
          <Link href="/login" className="btn btn--primary">
            Anmelden
          </Link>
        </div>
      ) : (
        <form className="panel store-panel store-surface" onSubmit={onSubmit}>
          <p className="muted">Firma: {me.companyName}</p>
          <div className="form-grid">
            <label>
              Art der Anfrage
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "montage" | "wartung" | "service")
                }
              >
                <option value="montage">Montage / Installation</option>
                <option value="wartung">Wartung</option>
                <option value="service">Sonstiger Service</option>
              </select>
            </label>
            <label>
              Wunschtermin
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </label>
            <label>
              Bezug Gerät / Artikel (optional)
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">— Keine Auswahl —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Beschreibung
              <textarea
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Standort, Ansprechpartner, besondere Hinweise…"
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="muted">{success}</p> : null}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Wird gesendet…" : "Serviceanfrage senden"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

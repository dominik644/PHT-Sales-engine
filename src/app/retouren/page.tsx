"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Me = { name: string; email: string; companyName: string } | null;
type OrderOpt = { id: string; number: string };

const TYPES = [
  { value: "return", label: "Retoure" },
  { value: "complaint", label: "Reklamation" },
  { value: "spare", label: "Ersatzteil / Service" },
  { value: "other", label: "Sonstiges" },
] as const;

export default function RetourenPage() {
  const [me, setMe] = useState<Me>(null);
  const [orders, setOrders] = useState<OrderOpt[]>([]);
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("return");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => setMe(d.user));
    void fetch("/api/account/orders?status=history")
      .then((r) => r.json())
      .then((d: { orders?: OrderOpt[] }) => {
        setOrders(
          (d.orders ?? []).map((o) => ({ id: o.id, number: o.number })),
        );
      })
      .catch(() => undefined);
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
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          message,
          orderId: orderId || null,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        ticket?: { number: string };
      };
      if (!res.ok || !data.ticket) {
        setError(data.error ?? "Ticket konnte nicht erstellt werden.");
        return;
      }
      setSuccess(`Ticket ${data.ticket.number} wurde aufgenommen.`);
      setSubject("");
      setMessage("");
      setOrderId("");
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Service</p>
        <h1>Retouren &amp; Support</h1>
        <p className="muted">
          Retouren, Reklamationen und Serviceanfragen als Ticket an PHT. Vor dem
          Produktivbetrieb rechtlich und organisatorisch freigeben.
        </p>
      </div>

      {!me ? (
        <div className="panel store-panel store-surface">
          <p className="muted">Tickets sind nur für angemeldete B2B-Kunden möglich.</p>
          <Link href="/login" className="btn btn--primary">
            Anmelden
          </Link>
        </div>
      ) : (
        <form className="panel store-panel store-surface" onSubmit={onSubmit}>
          <p className="muted">
            Firma: {me.companyName} · {me.name}
          </p>
          <label>
            Typ
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as (typeof TYPES)[number]["value"])
              }
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Betreff
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
              maxLength={200}
            />
          </label>
          <label>
            Beschreibung
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={5}
              maxLength={4000}
              rows={5}
            />
          </label>
          <label>
            Zugehöriger Auftrag (optional)
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">— keiner —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.number}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <div className="success-banner">{success}</div> : null}
          <div className="cta-row">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Wird gesendet…" : "Ticket absenden"}
            </button>
            <Link href="/account" className="btn btn--ink">
              Zum Kundenkonto
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

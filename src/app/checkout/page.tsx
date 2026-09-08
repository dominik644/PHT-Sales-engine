"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/context/CartContext";

type FormState = {
  address: string;
  city: string;
  postal: string;
  discountCode: string;
};

type Me = {
  name: string;
  email: string;
  companyName: string;
  companyStatus: string;
} | null;

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, itemCount } = useCart();
  const [me, setMe] = useState<Me>(null);
  const [placed, setPlaced] = useState<{
    number: string;
    status: string;
    message?: string;
    totalCents: number;
    discountCents: number;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    address: "",
    city: "",
    postal: "",
    discountCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => setMe(d.user));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!me) {
      setError("Bitte zuerst als B2B-Kunde anmelden.");
      return;
    }
    if (!form.address.trim() || !form.city.trim() || !form.postal.trim()) {
      setError("Bitte Lieferadresse vollständig ausfüllen.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          postal: form.postal,
          country: "DE",
          discountCode: form.discountCode || null,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        order?: {
          number: string;
          status: string;
          message?: string;
          totalCents: number;
          discountCents: number;
        };
      };
      if (!res.ok || !data.order) {
        setError(data.error ?? "Checkout fehlgeschlagen.");
        return;
      }
      clearCart();
      setPlaced({
        number: data.order.number,
        status: data.order.status,
        message: data.order.message,
        totalCents: data.order.totalCents,
        discountCents: data.order.discountCents,
      });
    } catch {
      setError("Netzwerkfehler beim Checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="checkout" style={{ display: "block", maxWidth: 640 }}>
        <div className="success-banner">
          <p className="eyebrow">Auftrag eingereicht</p>
          <h1 style={{ fontFamily: "var(--font-display)", margin: "0.35rem 0" }}>
            {placed.number}
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Status: <strong>{placed.status}</strong>
            {placed.discountCents > 0
              ? ` · Rabatt ${formatMoney(placed.discountCents)}`
              : ""}
            {" · "}
            Summe {formatMoney(placed.totalCents)}
          </p>
          <p className="muted">{placed.message}</p>
        </div>
        <Link href="/account" className="btn btn--primary">
          Zu Freigaben
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">B2B Checkout</p>
        <h1>Bestellanforderung</h1>
        <p className="muted">
          Nach dem Absenden: Freigabe Produktionsleiter → Einkauf → ERP erstellt
          Auftrag und Rechnung.
        </p>
      </header>

      {!me ? (
        <div className="section" style={{ paddingTop: "1rem" }}>
          <div className="panel">
            <p>B2B-Login erforderlich.</p>
            <div className="cta-row">
              <Link href="/login" className="btn btn--primary">
                Anmelden
              </Link>
              <Link href="/register" className="btn btn--ink">
                Registrieren
              </Link>
            </div>
          </div>
        </div>
      ) : itemCount === 0 ? (
        <div className="section" style={{ paddingTop: "1rem" }}>
          <div className="panel">
            <p>Warenkorb ist leer.</p>
            <Link href="/shop" className="btn btn--primary">
              Zum Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Lieferung · {me.companyName}</h2>
            <p className="muted">Besteller: {me.name}</p>
            <div className="form-grid">
              <label>
                Adresse
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Stadt
                <input
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                PLZ
                <input
                  value={form.postal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postal: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Rabattcode (optional, mit Laufzeit)
                <input
                  value={form.discountCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountCode: e.target.value }))
                  }
                  placeholder="z. B. PHT-B2B-10"
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={submitting || me.companyStatus !== "active"}
              >
                {me.companyStatus !== "active"
                  ? "Firma noch nicht freigeschaltet"
                  : submitting
                    ? "Wird eingereicht…"
                    : `Zur Freigabe senden · ${formatMoney(subtotalCents)}`}
              </button>
            </div>
          </form>

          <aside className="panel">
            <h2>Positionen</h2>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="summary-line">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatMoney(product.priceCents * quantity)}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Zwischensumme</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

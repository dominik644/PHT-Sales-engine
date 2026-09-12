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
  paymentTermId: string;
};

type Me = {
  name: string;
  email: string;
  companyName: string;
  companyStatus: string;
} | null;

type PaymentTerm = {
  id: string;
  code: string;
  name: string;
  description: string;
  depositPercent: number;
  balancePercent: number;
  balanceDueDays: number;
};

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, itemCount } = useCart();
  const [me, setMe] = useState<Me>(null);
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [placed, setPlaced] = useState<{
    number: string;
    status: string;
    message?: string;
    totalCents: number;
    discountCents: number;
    paymentTermLabel?: string | null;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    address: "",
    city: "",
    postal: "",
    discountCode: "",
    paymentTermId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => setMe(d.user));
    void fetch("/api/payment-terms")
      .then((r) => r.json())
      .then((d: { paymentTerms: PaymentTerm[] }) => {
        setTerms(d.paymentTerms);
        if (d.paymentTerms[0]) {
          setForm((f) => ({
            ...f,
            paymentTermId: f.paymentTermId || d.paymentTerms[0].id,
          }));
        }
      });
  }, []);

  const selectedTerm = terms.find((t) => t.id === form.paymentTermId);

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
    if (!form.paymentTermId) {
      setError("Bitte Zahlungsbedingung wählen.");
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
          paymentTermId: form.paymentTermId,
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
          paymentTermLabel?: string | null;
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
        paymentTermLabel: data.order.paymentTermLabel,
      });
    } catch {
      setError("Netzwerkfehler beim Checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="checkout-page">
        <header className="checkout-steps" aria-label="Bestellschritte">
          <span>1. Warenkorb</span>
          <span>2. Kasse</span>
          <span className="is-active">3. Bestätigung</span>
        </header>
        <div className="success-banner">
          <p className="eyebrow">Auftrag eingereicht</p>
          <h1>{placed.number}</h1>
          <p className="muted">
            Status: <strong>{placed.status}</strong>
            {placed.discountCents > 0
              ? ` · Rabatt ${formatMoney(placed.discountCents)}`
              : ""}
            {" · "}
            Summe {formatMoney(placed.totalCents)}
          </p>
          {placed.paymentTermLabel ? (
            <p className="muted">Zahlungsbedingung: {placed.paymentTermLabel}</p>
          ) : null}
          <p className="muted">{placed.message}</p>
          <div className="cta-row">
            <Link href="/account" className="btn btn--primary">
              Zur Auftragshistorie
            </Link>
            <Link href="/shop" className="btn btn--ink">
              Weiter einkaufen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-steps" aria-label="Bestellschritte">
        <Link href="/warenkorb">1. Warenkorb</Link>
        <span className="is-active">2. Kasse</span>
        <span>3. Bestätigung</span>
      </header>

      <div className="cart-page__head">
        <div>
          <p className="eyebrow">Bestellung</p>
          <h1>Kasse</h1>
          <p className="muted">
            Lieferadresse, Zahlungsbedingung und optionaler Rabattcode.
          </p>
        </div>
      </div>

      {!me ? (
        <div className="panel store-panel">
          <h2>B2B-Anmeldung erforderlich</h2>
          <p className="muted">
            Bestellungen sind nur für registrierte Firmenkunden möglich.
          </p>
          <div className="cta-row">
            <Link href="/login" className="btn btn--primary">
              Anmelden
            </Link>
            <Link href="/register" className="btn btn--ink">
              Firma registrieren
            </Link>
          </div>
        </div>
      ) : itemCount === 0 ? (
        <div className="empty-state">
          <p>Warenkorb ist leer.</p>
          <Link href="/shop" className="btn btn--primary">
            Zum Sortiment
          </Link>
        </div>
      ) : (
        <div className="checkout">
          <form className="panel store-panel" onSubmit={handleSubmit} noValidate>
            <h2>Lieferung · {me.companyName}</h2>
            <p className="muted">Besteller: {me.name} · {me.email}</p>
            <div className="form-grid">
              <label>
                Straße und Hausnummer
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Ort
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
                Zahlungsbedingung
                <select
                  value={form.paymentTermId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentTermId: e.target.value }))
                  }
                  required
                >
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} — {term.depositPercent}/{term.balancePercent}
                    </option>
                  ))}
                </select>
              </label>
              {selectedTerm ? (
                <p className="muted">{selectedTerm.description}</p>
              ) : null}
              <label>
                Rabattcode (optional)
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
                    : `Bestellung zur Freigabe senden · ${formatMoney(subtotalCents)}`}
              </button>
            </div>
          </form>

          <aside className="panel store-panel">
            <h2>Positionen</h2>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="summary-line">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatMoney(product.priceCents * quantity)}</span>
              </div>
            ))}
            <div className="summary-line summary-line--total">
              <span>Zwischensumme</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
            <Link href="/warenkorb" className="text-btn">
              Warenkorb bearbeiten
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

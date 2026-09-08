"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/context/CartContext";

type FormState = {
  name: string;
  email: string;
  address: string;
  city: string;
  postal: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  address: "",
  city: "",
  postal: "",
};

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, itemCount } = useCart();
  const [placed, setPlaced] = useState<{
    number: string;
    erpSyncStatus: string;
    erpOrderId: string | null;
  } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = Object.entries(form).find(([, value]) => !value.trim());
    if (missing) {
      setError("Bitte alle Lieferfelder ausfüllen.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          country: "DE",
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
          erpSyncStatus: string;
          erpOrderId: string | null;
        };
      };
      if (!res.ok || !data.order) {
        setError(data.error ?? "Checkout fehlgeschlagen.");
        return;
      }
      clearCart();
      setPlaced({
        number: data.order.number,
        erpSyncStatus: data.order.erpSyncStatus,
        erpOrderId: data.order.erpOrderId,
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
          <p className="eyebrow">Order confirmed</p>
          <h1 style={{ fontFamily: "var(--font-display)", margin: "0.35rem 0" }}>
            Thanks — order {placed.number} is in.
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            ERP sync: <strong>{placed.erpSyncStatus}</strong>
            {placed.erpOrderId ? ` · ${placed.erpOrderId}` : ""}. Stock was
            reserved server-side and pushed to the configured ERP adapter.
          </p>
        </div>
        <Link href="/shop" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">Checkout</p>
        <h1>Almost there</h1>
        <p className="muted">
          Secure server-side order with stock lock and ERP handoff.
        </p>
      </header>

      {itemCount === 0 ? (
        <div className="section" style={{ paddingTop: "1rem" }}>
          <div className="panel">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn btn--primary">
              Browse products
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Shipping</h2>
            <div className="form-grid">
              <label>
                Full name
                <input
                  name="name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </label>
              <label>
                Address
                <input
                  name="address"
                  required
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </label>
              <label>
                Postal code
                <input
                  name="postal"
                  required
                  autoComplete="postal-code"
                  value={form.postal}
                  onChange={(e) => updateField("postal", e.target.value)}
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={submitting}
              >
                {submitting
                  ? "Placing order…"
                  : `Place order · ${formatMoney(subtotalCents)}`}
              </button>
            </div>
          </form>

          <aside className="panel">
            <h2>Order summary</h2>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="summary-line">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatMoney(product.priceCents * quantity)}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

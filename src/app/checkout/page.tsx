"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/context/CartContext";

type FormState = {
  address: string;
  city: string;
  postal: string;
  discountCode: string;
  paymentTermId: string;
  shippingMethodCode: string;
  montageRequested: boolean;
  montageNote: string;
};

type Me = {
  name: string;
  email: string;
  role?: string;
  companyName: string;
  companyStatus: string;
  requiresPrepaid?: boolean;
  defaultPaymentTermId?: string | null;
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

type ShippingMethod = {
  code: string;
  name: string;
  description: string;
  cents: number;
  allowsPickup: boolean;
};

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, itemCount } = useCart();
  const [me, setMe] = useState<Me>(null);
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [shipping, setShipping] = useState<ShippingMethod[]>([]);
  const [placed, setPlaced] = useState<{
    number: string;
    status: string;
    message?: string;
    totalCents: number;
    discountCents: number;
    shippingCents?: number;
    paymentTermLabel?: string | null;
    shippingMethodLabel?: string | null;
    partialStock?: string[];
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    address: "",
    city: "",
    postal: "",
    discountCode: "",
    paymentTermId: "",
    shippingMethodCode: "",
    montageRequested: false,
    montageNote: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => {
        setMe(d.user);
        if (d.user?.defaultPaymentTermId) {
          setForm((f) => ({
            ...f,
            paymentTermId: f.paymentTermId || d.user!.defaultPaymentTermId!,
          }));
        }
      });
    void fetch("/api/payment-terms")
      .then((r) => r.json())
      .then((d: { paymentTerms: PaymentTerm[] }) => {
        setTerms(d.paymentTerms);
      });
  }, []);

  useEffect(() => {
    void fetch(`/api/shipping?subtotal=${subtotalCents}`)
      .then((r) => r.json())
      .then((d: { shippingMethods: ShippingMethod[] }) => {
        setShipping(d.shippingMethods);
        setForm((f) => ({
          ...f,
          shippingMethodCode:
            f.shippingMethodCode || d.shippingMethods[0]?.code || "",
        }));
      });
  }, [subtotalCents]);

  useEffect(() => {
    if (!me?.requiresPrepaid || !terms.length) return;
    const vorkasse = terms.find((t) => t.code === "VORKASSE");
    if (vorkasse) {
      setForm((f) => ({ ...f, paymentTermId: vorkasse.id }));
    }
  }, [me?.requiresPrepaid, terms]);

  useEffect(() => {
    if (me?.requiresPrepaid) return;
    if (me?.defaultPaymentTermId) {
      setForm((f) => ({
        ...f,
        paymentTermId: me.defaultPaymentTermId || f.paymentTermId,
      }));
    } else if (terms[0] && !form.paymentTermId) {
      setForm((f) => ({ ...f, paymentTermId: terms[0].id }));
    }
  }, [me?.defaultPaymentTermId, me?.requiresPrepaid, terms, form.paymentTermId]);

  const selectedTerm = terms.find((t) => t.id === form.paymentTermId);
  const selectedShipping = shipping.find(
    (s) => s.code === form.shippingMethodCode,
  );
  const estimatedTotal = useMemo(
    () => subtotalCents + (selectedShipping?.cents ?? 0),
    [subtotalCents, selectedShipping],
  );

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
    if (!form.shippingMethodCode) {
      setError("Bitte Versandart wählen.");
      return;
    }
    if (items.some((item) => item.product.priceCents == null)) {
      setError("Warenkorb enthält Positionen ohne Preis. Bitte neu anmelden und Artikel erneut hinzufügen.");
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
          shippingMethodCode: form.shippingMethodCode,
          montageRequested: form.montageRequested,
          montageNote: form.montageNote || null,
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
          shippingCents?: number;
          paymentTermLabel?: string | null;
          shippingMethodLabel?: string | null;
          partialStock?: string[];
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
        shippingCents: data.order.shippingCents,
        paymentTermLabel: data.order.paymentTermLabel,
        shippingMethodLabel: data.order.shippingMethodLabel,
        partialStock: data.order.partialStock,
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
            {placed.shippingCents
              ? ` · Versand ${formatMoney(placed.shippingCents)}`
              : ""}
            {" · "}
            Summe {formatMoney(placed.totalCents)}
          </p>
          {placed.paymentTermLabel ? (
            <p className="muted">Zahlungsbedingung: {placed.paymentTermLabel}</p>
          ) : null}
          {placed.shippingMethodLabel ? (
            <p className="muted">Versand: {placed.shippingMethodLabel}</p>
          ) : null}
          {placed.partialStock?.length ? (
            <p className="muted">
              Teillieferung: {placed.partialStock.join("; ")}
            </p>
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

  const visibleTerms = me?.requiresPrepaid
    ? terms.filter((t) => t.code === "VORKASSE")
    : terms;

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
            Lieferadresse, Zahlungsbedingung, Versand und optional Montage.
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
      ) : me.role === "REQUESTER" ? (
        <div className="panel store-panel">
          <h2>Keine Bestellberechtigung</h2>
          <p className="muted">
            Als Anforderer können Sie Warenkorb und Angebotsanfragen nutzen,
            aber keine verbindlichen Bestellungen auslösen. Bitte Einkauf oder
            Firmen-Admin.
          </p>
          <div className="cta-row">
            <Link href="/angebot" className="btn btn--primary">
              Angebot anfordern
            </Link>
            <Link href="/account" className="btn btn--ink">
              Zum Kundenkonto
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
            <p className="muted">
              Besteller: {me.name} · {me.email}
            </p>
            {me.requiresPrepaid ? (
              <p className="muted">
                Für Ihr Konto ist Vorauskasse vorgeschrieben.
              </p>
            ) : null}
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
                  disabled={Boolean(me.requiresPrepaid)}
                >
                  {visibleTerms.map((term) => (
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
                Versandart
                <select
                  value={form.shippingMethodCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shippingMethodCode: e.target.value,
                    }))
                  }
                  required
                >
                  {shipping.map((method) => (
                    <option key={method.code} value={method.code}>
                      {method.name} —{" "}
                      {method.cents === 0
                        ? "kostenfrei"
                        : formatMoney(method.cents)}
                    </option>
                  ))}
                </select>
              </label>
              {selectedShipping ? (
                <p className="muted">{selectedShipping.description}</p>
              ) : null}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.montageRequested}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      montageRequested: e.target.checked,
                    }))
                  }
                />
                Montage / Installation mitbestellen
              </label>
              {form.montageRequested ? (
                <label>
                  Hinweis zur Montage
                  <textarea
                    rows={3}
                    value={form.montageNote}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, montageNote: e.target.value }))
                    }
                    placeholder="Wunschtermin, Standort, Ansprechpartner…"
                  />
                </label>
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
                    : `Bestellung zur Freigabe senden · ${formatMoney(estimatedTotal)}`}
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
                <span>{(product.priceCents == null ? "—" : formatMoney(product.priceCents * quantity))}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Zwischensumme</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
            <div className="summary-line">
              <span>Versand</span>
              <span>
                {selectedShipping
                  ? selectedShipping.cents === 0
                    ? "kostenfrei"
                    : formatMoney(selectedShipping.cents)
                  : "—"}
              </span>
            </div>
            <div className="summary-line summary-line--total">
              <span>Geschätzt</span>
              <span>{formatMoney(estimatedTotal)}</span>
            </div>
            <p className="muted">
              Bei Teilbestand wird der verfügbare Anteil sofort reserviert; der
              Rest geht in Nachlieferung — die Bestellung wird nicht blockiert.
            </p>
            <Link href="/warenkorb" className="text-btn">
              Warenkorb bearbeiten
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

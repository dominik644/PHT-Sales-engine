"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";

type Me = { name: string; email: string; companyName: string } | null;
type ManualLine = { sku: string; name: string; quantity: number; note: string };
type CatalogProduct = { id: string; sku: string; name: string };

export default function AngebotPage() {
  const { items, clearCart } = useCart();
  const [me, setMe] = useState<Me>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [note, setNote] = useState("");
  const [fromCart, setFromCart] = useState(true);
  const [manual, setManual] = useState<ManualLine[]>([
    { sku: "", name: "", quantity: 1, note: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => setMe(d.user));
    void fetch("/api/products")
      .then((r) => r.json())
      .then((d: { products: CatalogProduct[] }) => setCatalog(d.products ?? []));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!me) {
      setError("Bitte zuerst anmelden.");
      return;
    }

    const byId = new Map(catalog.map((p) => [p.id, p]));
    const payloadItems = fromCart
      ? items.map((item) => {
          const match = byId.get(item.product.id);
          return {
            productId: item.product.id,
            sku: match?.sku ?? item.product.sku ?? item.product.slug,
            name: item.product.name,
            quantity: item.quantity,
            note: "",
          };
        })
      : manual
          .filter((l) => l.sku.trim() && l.name.trim())
          .map((l) => ({
            sku: l.sku.trim(),
            name: l.name.trim(),
            quantity: l.quantity,
            note: l.note,
          }));

    if (!payloadItems.length) {
      setError(
        fromCart
          ? "Warenkorb ist leer."
          : "Bitte mindestens eine manuelle Position angeben.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, items: payloadItems }),
      });
      const data = (await res.json()) as {
        error?: string;
        quote?: { number: string };
      };
      if (!res.ok || !data.quote) {
        setError(data.error ?? "Anfrage fehlgeschlagen.");
        return;
      }
      setSuccess(`Angebotsanfrage ${data.quote.number} wurde übermittelt.`);
      if (fromCart) clearCart();
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
          <p className="eyebrow">B2B</p>
          <h1>Angebot anfordern</h1>
          <p className="muted">
            Fordern Sie ein verbindliches Angebot aus dem Warenkorb oder mit
            manuellen Positionen an.
          </p>
        </div>
      </div>

      {!me ? (
        <div className="panel store-panel">
          <h2>Anmeldung erforderlich</h2>
          <p className="muted">Angebotsanfragen sind nur für B2B-Kunden möglich.</p>
          <Link href="/login" className="btn btn--primary">
            Anmelden
          </Link>
        </div>
      ) : (
        <form className="panel store-panel store-surface" onSubmit={onSubmit}>
          <p className="muted">
            Firma: {me.companyName} · {me.name}
          </p>
          <div className="form-grid">
            <label>
              Quelle
              <select
                value={fromCart ? "cart" : "manual"}
                onChange={(e) => setFromCart(e.target.value === "cart")}
              >
                <option value="cart">
                  Aus Warenkorb ({items.length} Positionen)
                </option>
                <option value="manual">Manuelle Positionen</option>
              </select>
            </label>

            {!fromCart
              ? manual.map((line, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gap: "0.75rem",
                      gridTemplateColumns: "1fr 2fr 1fr",
                    }}
                  >
                    <label>
                      SKU
                      <input
                        value={line.sku}
                        onChange={(e) =>
                          setManual((prev) =>
                            prev.map((l, i) =>
                              i === index
                                ? { ...l, sku: e.target.value.toUpperCase() }
                                : l,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Bezeichnung
                      <input
                        value={line.name}
                        onChange={(e) =>
                          setManual((prev) =>
                            prev.map((l, i) =>
                              i === index ? { ...l, name: e.target.value } : l,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Menge
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          setManual((prev) =>
                            prev.map((l, i) =>
                              i === index
                                ? {
                                    ...l,
                                    quantity: Math.max(
                                      1,
                                      Number(e.target.value) || 1,
                                    ),
                                  }
                                : l,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                ))
              : null}

            {!fromCart ? (
              <button
                type="button"
                className="btn btn--ink"
                onClick={() =>
                  setManual((prev) => [
                    ...prev,
                    { sku: "", name: "", quantity: 1, note: "" },
                  ])
                }
              >
                Position hinzufügen
              </button>
            ) : null}

            <label>
              Hinweis an PHT
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Liefertermin, Projekt, Sonderwünsche…"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="muted">{success}</p> : null}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Wird gesendet…" : "Angebotsanfrage senden"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

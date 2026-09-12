"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";

type Row = { sku: string; quantity: number };
type LookupProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  image: string;
  minOrderQty: number;
};

function parseCsv(text: string): Row[] {
  const rows: Row[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^sku/i.test(trimmed)) continue;
    const parts = trimmed.split(/[;,\t]/).map((p) => p.trim());
    const sku = parts[0];
    const qty = Number(parts[1] ?? "1");
    if (!sku || !Number.isFinite(qty) || qty < 1) continue;
    rows.push({ sku, quantity: Math.floor(qty) });
  }
  return rows;
}

export default function SchnellbestellungPage() {
  const { addItem } = useCart();
  const [rows, setRows] = useState<Row[]>([
    { sku: "", quantity: 1 },
    { sku: "", quantity: 1 },
  ]);
  const [paste, setPaste] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filled = useMemo(
    () => rows.filter((r) => r.sku.trim().length > 0),
    [rows],
  );

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function applyPaste() {
    const parsed = parseCsv(paste);
    if (!parsed.length) {
      setError("Keine gültigen CSV-Zeilen gefunden (SKU;Menge).");
      return;
    }
    setRows(parsed);
    setError(null);
    setMessage(`${parsed.length} Zeilen aus CSV übernommen.`);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setPaste(text);
      const parsed = parseCsv(text);
      if (parsed.length) {
        setRows(parsed);
        setMessage(`${parsed.length} Zeilen aus Datei übernommen.`);
        setError(null);
      } else {
        setError("Datei enthält keine gültigen Zeilen.");
      }
    };
    reader.readAsText(file);
  }

  async function addAllToCart() {
    if (!filled.length) {
      setError("Bitte mindestens eine SKU eintragen.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    let added = 0;
    const missing: string[] = [];
    try {
      for (const row of filled) {
        const res = await fetch(
          `/api/products?sku=${encodeURIComponent(row.sku.trim())}`,
        );
        const data = (await res.json()) as {
          product?: LookupProduct;
          error?: string;
        };
        if (!res.ok || !data.product) {
          missing.push(row.sku.trim());
          continue;
        }
        const qty = Math.max(row.quantity, data.product.minOrderQty || 1);
        addItem(
          {
            id: data.product.id,
            slug: data.product.slug,
            name: data.product.name,
            priceCents: data.product.priceCents,
            image: data.product.image,
          },
          qty,
        );
        added += 1;
      }
      if (missing.length) {
        setError(`Nicht gefunden: ${missing.join(", ")}`);
      }
      if (added) {
        setMessage(`${added} Position(en) in den Warenkorb gelegt.`);
      }
    } catch {
      setError("Netzwerkfehler bei der SKU-Suche.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section">
      <div className="section__head">
        <div>
          <p className="eyebrow">B2B</p>
          <h1>Schnellbestellung</h1>
          <p className="muted">
            Artikelnummern und Mengen eingeben oder als CSV (SKU;Menge)
            einfügen/hochladen.
          </p>
        </div>
        <Link href="/warenkorb" className="btn btn--ink">
          Zum Warenkorb
        </Link>
      </div>

      <div className="checkout" style={{ alignItems: "start" }}>
        <div className="panel store-panel store-surface">
          <h2>Positionen</h2>
          <div className="form-grid">
            {rows.map((row, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr auto",
                  gap: "0.75rem",
                  alignItems: "end",
                }}
              >
                <label>
                  SKU / Art.-Nr.
                  <input
                    value={row.sku}
                    onChange={(e) =>
                      updateRow(index, { sku: e.target.value.toUpperCase() })
                    }
                    placeholder="z. B. PHT-HAND-1L"
                  />
                </label>
                <label>
                  Menge
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(index, {
                        quantity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn btn--ink btn--sm"
                  onClick={() =>
                    setRows((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={rows.length <= 1}
                >
                  Entfernen
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ink"
              onClick={() =>
                setRows((prev) => [...prev, { sku: "", quantity: 1 }])
              }
            >
              Zeile hinzufügen
            </button>
            {error ? <p className="form-error">{error}</p> : null}
            {message ? <p className="muted">{message}</p> : null}
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => void addAllToCart()}
            >
              {busy ? "Wird geladen…" : "In den Warenkorb"}
            </button>
          </div>
        </div>

        <aside className="panel store-panel store-surface">
          <h2>CSV</h2>
          <p className="muted">
            Format: <code>SKU;Menge</code> — eine Zeile pro Artikel.
          </p>
          <div className="form-grid">
            <label>
              Einfügen
              <textarea
                rows={8}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder={"PHT-HAND-1L;24\nPHT-NORMWAGEN;2"}
              />
            </label>
            <button type="button" className="btn btn--ink" onClick={applyPaste}>
              CSV übernehmen
            </button>
            <label>
              Datei hochladen
              <input type="file" accept=".csv,.txt,text/csv" onChange={onFile} />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}

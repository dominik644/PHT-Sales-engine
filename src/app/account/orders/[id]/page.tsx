"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { roleLabel } from "@/lib/role-labels";
import { useCart } from "@/context/CartContext";

type OrderDetail = {
  id: string;
  number: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountCode: string | null;
  erpOrderId: string | null;
  erpInvoiceId: string | null;
  erpSyncStatus: string;
  canApprove: boolean;
  requester: { name: string; email: string; role: string } | null;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitCents: number;
    lineTotalCents: number;
    availableNowQty?: number;
    backorderQty?: number;
  }>;
  approvals: Array<{
    role: string;
    decision: string;
    note: string | null;
    createdAt: string;
    user: { name: string };
  }>;
  events: Array<{ type: string; message: string; createdAt: string }>;
  invoice: {
    number: string;
    status: string;
    amountCents: number;
    erpInvoiceId: string;
    issuedAt: string;
  } | null;
};

const statusLabel: Record<string, string> = {
  awaiting_production_approval: "Wartet auf Produktionsleiter",
  awaiting_purchasing_approval: "Wartet auf Einkauf",
  approved: "Freigegeben",
  confirmed: "Im ERP bestätigt",
  rejected: "Abgelehnt",
  cancelled: "Storniert",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [reorderMsg, setReorderMsg] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  async function reload() {
    if (!params.id) return;
    const res = await fetch(`/api/account/orders/${params.id}`);
    if (!res.ok) throw new Error("Auftrag nicht gefunden");
    const data = (await res.json()) as { order: OrderDetail };
    setOrder(data.order);
  }

  useEffect(() => {
    if (!params.id) return;
    void reload().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Fehler"),
    );
  }, [params.id]);

  async function decide(decision: "approved" | "rejected") {
    if (!order) return;
    setActing(true);
    setActionMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, decision }),
      });
      const data = (await res.json()) as {
        error?: string;
        order?: OrderDetail;
      };
      if (!res.ok) {
        setError(data.error ?? "Freigabe fehlgeschlagen");
        return;
      }
      if (data.order?.status === "awaiting_purchasing_approval") {
        setActionMsg(
          "An Einkauf übergeben. Der Auftrag bleibt unter Konto → Freigabe-Pipeline sichtbar.",
        );
      } else if (decision === "approved") {
        setActionMsg("Freigabe gespeichert.");
      } else {
        setActionMsg("Auftrag abgelehnt.");
      }
      await reload();
    } catch {
      setError("Netzwerkfehler bei der Freigabe.");
    } finally {
      setActing(false);
    }
  }

  if (error && !order) {
    return (
      <div className="section">
        <p className="form-error">{error}</p>
        <Link href="/account" className="btn btn--ink">
          Zurück zu meinen Aufträgen
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section">
        <p className="muted">Lade Auftragsdetails…</p>
      </div>
    );
  }

  async function reorder() {
    if (!order) return;
    setReorderMsg(null);
    let added = 0;
    for (const item of order.items) {
      try {
        const res = await fetch(
          `/api/products?sku=${encodeURIComponent(item.sku)}`,
        );
        const data = (await res.json()) as {
          product?: {
            id: string;
            slug: string;
            sku?: string;
            name: string;
            priceCents: number | null;
            image: string;
            minOrderQty?: number;
          };
        };
        if (!res.ok || !data.product || data.product.priceCents == null) continue;
        addItem(
          {
            id: data.product.id,
            slug: data.product.slug,
            sku: data.product.sku,
            name: data.product.name,
            priceCents: data.product.priceCents,
            image: data.product.image,
            minOrderQty: data.product.minOrderQty,
          },
          item.quantity,
        );
        added += 1;
      } catch {
        // skip
      }
    }
    setReorderMsg(
      added
        ? `${added} Position(en) erneut in den Warenkorb gelegt.`
        : "Keine Positionen konnten nachbestellt werden.",
    );
  }

  return (
    <div className="section">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Verkaufshistorie</p>
          <h1>{order.number}</h1>
          <p className="muted">
            {statusLabel[order.status] ?? order.status} ·{" "}
            {new Date(order.createdAt).toLocaleString("de-DE")}
          </p>
        </div>
        <div className="cta-row">
          {order.canApprove ? (
            <>
              <button
                type="button"
                className="btn btn--primary"
                disabled={acting}
                onClick={() => void decide("approved")}
              >
                {acting ? "…" : "Freigeben"}
              </button>
              <button
                type="button"
                className="btn btn--ink"
                disabled={acting}
                onClick={() => void decide("rejected")}
              >
                Ablehnen
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void reorder()}
          >
            Erneut bestellen
          </button>
          <Link href="/account" className="btn btn--ink">
            Zurück
          </Link>
        </div>
      </header>
      {actionMsg ? <div className="success-banner">{actionMsg}</div> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {reorderMsg ? <p className="muted">{reorderMsg}</p> : null}

      <section className="admin-grid">
        <div className="panel">
          <h2>Positionen</h2>
          {order.items.map((item) => (
            <div key={item.sku + item.name} className="summary-line">
              <span>
                {item.name} ({item.sku}) × {item.quantity}
                {item.backorderQty && item.backorderQty > 0
                  ? ` · ${item.availableNowQty ?? 0} sofort / ${item.backorderQty} Nachlieferung`
                  : ""}
              </span>
              <span>{formatMoney(item.lineTotalCents)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Zwischensumme</span>
            <span>{formatMoney(order.subtotalCents)}</span>
          </div>
          {order.discountCents > 0 ? (
            <div className="summary-line">
              <span>Rabatt {order.discountCode}</span>
              <span>−{formatMoney(order.discountCents)}</span>
            </div>
          ) : null}
          <div className="summary-line">
            <span>Gesamt</span>
            <span>{formatMoney(order.totalCents)}</span>
          </div>
        </div>

        <div className="panel">
          <h2>Lieferung & ERP</h2>
          <p className="muted">
            {order.name} · {order.email}
            <br />
            {order.addressLine1}, {order.postalCode} {order.city}, {order.country}
          </p>
          {order.requester ? (
            <p className="muted">
              Besteller: {order.requester.name} (
              {roleLabel(order.requester.role)})
            </p>
          ) : null}
          <p className="muted">
            ERP Sync: {order.erpSyncStatus}
            {order.erpOrderId ? ` · Auftrag ${order.erpOrderId}` : ""}
            {order.erpInvoiceId ? ` · Rechnung ${order.erpInvoiceId}` : ""}
          </p>
          {order.invoice ? (
            <p>
              <strong>Rechnung {order.invoice.number}</strong>
              <br />
              <span className="muted">
                {order.invoice.status} · {formatMoney(order.invoice.amountCents)}{" "}
                · {new Date(order.invoice.issuedAt).toLocaleDateString("de-DE")}
              </span>
            </p>
          ) : (
            <p className="muted">Noch keine ERP-Rechnung.</p>
          )}
        </div>
      </section>

      <section className="admin-grid" style={{ marginTop: "1.25rem" }}>
        <div className="panel">
          <h2>Freigaben</h2>
          {order.approvals.length === 0 ? (
            <p className="muted">Noch keine Freigaben.</p>
          ) : (
            <div className="admin-table">
              {order.approvals.map((a, idx) => (
                <div key={idx} className="admin-row">
                  <div>
                    <strong>
                      {roleLabel(a.role)} · {a.decision}
                    </strong>
                    <p className="muted">
                      {a.user.name}
                      {a.note ? ` — ${a.note}` : ""}
                    </p>
                  </div>
                  <span className="muted">
                    {new Date(a.createdAt).toLocaleString("de-DE")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Ereignisse</h2>
          <div className="admin-table">
            {order.events.map((e, idx) => (
              <div key={idx} className="admin-row">
                <div>
                  <strong>{e.type}</strong>
                  <p className="muted">{e.message}</p>
                </div>
                <span className="muted">
                  {new Date(e.createdAt).toLocaleString("de-DE")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

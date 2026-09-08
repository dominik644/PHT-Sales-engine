"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountCode: string | null;
  erpOrderId: string | null;
  erpInvoiceId: string | null;
  canApprove: boolean;
  invoice: { number: string; status: string } | null;
  items: Array<{ name: string; quantity: number; unitCents: number }>;
};

type Me = {
  name: string;
  roleLabel: string;
  companyName: string;
  companyStatus: string;
};

const statusLabel: Record<string, string> = {
  awaiting_production_approval: "Wartet auf Produktionsleiter",
  awaiting_purchasing_approval: "Wartet auf Einkauf",
  approved: "Freigegeben",
  confirmed: "Im ERP bestätigt",
  rejected: "Abgelehnt",
};

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = (await meRes.json()) as { user: Me | null };
    if (!meData.user) {
      setMe(null);
      return;
    }
    setMe(meData.user);
    const ordersRes = await fetch("/api/account/orders");
    if (ordersRes.ok) {
      const data = (await ordersRes.json()) as { orders: OrderRow[] };
      setOrders(data.orders);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(orderId: string, decision: "approved" | "rejected") {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/account/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, decision }),
    });
    const data = (await res.json()) as { error?: string; order?: OrderRow };
    if (!res.ok) {
      setError(data.error ?? "Aktion fehlgeschlagen");
      return;
    }
    if (decision === "approved" && data.order?.status === "confirmed") {
      setMessage(
        `Freigabe abgeschlossen. ERP Auftrag ${data.order.erpOrderId}, Rechnung ${data.order.invoice?.number ?? data.order.erpInvoiceId}`,
      );
    } else {
      setMessage(
        decision === "approved"
          ? "Freigabe gespeichert — nächste Stufe folgt."
          : "Auftrag abgelehnt.",
      );
    }
    await load();
  }

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  if (!me) {
    return (
      <div className="section">
        <h1>Konto</h1>
        <p className="muted">Bitte anmelden, um B2B-Aufträge zu sehen.</p>
        <Link href="/login" className="btn btn--primary">
          Anmelden
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <header className="admin-header">
        <div>
          <p className="eyebrow">B2B Konto</p>
          <h1>{me.companyName}</h1>
          <p className="muted">
            {me.name} · {me.roleLabel} · Firma: {me.companyStatus}
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/shop" className="btn btn--primary">
            Zum Shop
          </Link>
          <button type="button" className="btn btn--ink" onClick={logout}>
            Abmelden
          </button>
        </div>
      </header>

      {me.companyStatus !== "active" ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <p>
            Ihre Firma ist <strong>{me.companyStatus}</strong>. PHT muss den
            Zugang freischalten, bevor Bestellungen möglich sind.
          </p>
        </div>
      ) : null}

      {message ? <div className="success-banner">{message}</div> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="panel">
        <h2>Aufträge & Freigaben</h2>
        <div className="admin-table">
          {orders.map((order) => (
            <div key={order.id} className="admin-row">
              <div>
                <strong>{order.number}</strong>
                <p className="muted">
                  {statusLabel[order.status] ?? order.status}
                  {order.discountCode ? ` · Rabatt ${order.discountCode}` : ""}
                </p>
                <p className="muted">
                  {order.items
                    .map((i) => `${i.name} × ${i.quantity}`)
                    .join(", ")}
                </p>
                {order.invoice ? (
                  <p className="muted">
                    Rechnung {order.invoice.number} ({order.invoice.status})
                  </p>
                ) : null}
              </div>
              <div className="admin-row__meta">
                <span>{formatMoney(order.totalCents)}</span>
                <span className={`pill pill--${order.status.includes("awaiting") ? "pending" : order.status === "confirmed" ? "ok" : order.status}`}>
                  {order.status}
                </span>
                {order.canApprove ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => decide(order.id, "approved")}
                    >
                      Freigeben
                    </button>
                    <button
                      type="button"
                      className="btn btn--ink"
                      onClick={() => decide(order.id, "rejected")}
                    >
                      Ablehnen
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {orders.length === 0 ? (
            <p className="muted">Noch keine Aufträge.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

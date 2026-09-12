"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import { roleLabel } from "@/lib/role-labels";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  createdAt: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountCode: string | null;
  erpOrderId: string | null;
  erpInvoiceId: string | null;
  canApprove: boolean;
  requester: { name: string; role: string } | null;
  invoice: {
    number: string;
    status: string;
    amountCents: number;
    issuedAt: string;
  } | null;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitCents: number;
    lineTotalCents: number;
  }>;
};

type Stats = {
  orderCount: number;
  confirmedCount: number;
  openCount: number;
  totalSpentCents: number;
};

type Me = {
  name: string;
  role: string;
  roleLabel: string;
  companyName: string;
  companyStatus: string;
};

type QuoteRow = {
  id: string;
  number: string;
  status: string;
  note: string;
  offeredTotalCents: number | null;
  offeredNote: string;
  validUntil: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    quantity: number;
    unitCents: number | null;
  }>;
};

type TicketRow = {
  id: string;
  number: string;
  type: string;
  subject: string;
  status: string;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  awaiting_production_approval: "Wartet auf Produktionsleiter",
  awaiting_purchasing_approval: "Wartet auf Einkauf",
  approved: "Freigegeben",
  confirmed: "Im ERP bestätigt",
  rejected: "Abgelehnt",
  cancelled: "Storniert",
};

type Filter = "all" | "open" | "history";

function nextActorLabel(status: string): string | null {
  if (status === "awaiting_production_approval") return "Produktionsleiter";
  if (status === "awaiting_purchasing_approval") return "Einkauf";
  return null;
}

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pipeline, setPipeline] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ephemeralDemo, setEphemeralDemo] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = (await meRes.json()) as { user: Me | null };
    if (!meData.user) {
      setMe(null);
      return;
    }
    setMe(meData.user);

    const params = new URLSearchParams();
    if (filter === "open") params.set("status", "open");
    if (filter === "history") params.set("status", "history");
    if (query.trim()) params.set("q", query.trim());

    // Historie-Filter und Freigabe-Pipeline getrennt laden — sonst verschwinden
    // Einkaufs-Freigaben, sobald „Abgeschlossen“ aktiv ist.
    const [ordersRes, pipelineRes, quotesRes, ticketsRes] = await Promise.all([
      fetch(`/api/account/orders?${params.toString()}`),
      fetch("/api/account/orders?status=open"),
      fetch("/api/quotes"),
      fetch("/api/tickets"),
    ]);
    if (ordersRes.ok) {
      const data = (await ordersRes.json()) as {
        orders: OrderRow[];
        stats: Stats;
      };
      setOrders(data.orders);
      setStats(data.stats);
    }
    if (pipelineRes.ok) {
      const data = (await pipelineRes.json()) as { orders: OrderRow[] };
      setPipeline(data.orders);
    }
    if (quotesRes.ok) {
      const data = (await quotesRes.json()) as { quotes: QuoteRow[] };
      setQuotes(data.quotes);
    }
    if (ticketsRes.ok) {
      const data = (await ticketsRes.json()) as { tickets: TicketRow[] };
      setTickets(data.tickets);
    }
  }, [filter, query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetch("/api/ready")
      .then((r) => r.json())
      .then((d: { serverlessDemoDb?: boolean }) => {
        setEphemeralDemo(Boolean(d.serverlessDemoDb));
      })
      .catch(() => undefined);
  }, []);

  const pendingApprovals = useMemo(
    () => pipeline.filter((o) => o.canApprove),
    [pipeline],
  );

  const waitingPipeline = useMemo(
    () =>
      pipeline.filter((o) =>
        ["awaiting_production_approval", "awaiting_purchasing_approval"].includes(
          o.status,
        ),
      ),
    [pipeline],
  );

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
    } else if (
      decision === "approved" &&
      data.order?.status === "awaiting_purchasing_approval"
    ) {
      setMessage(
        `An Einkauf übergeben (${data.order.number}). Der Auftrag bleibt in der Freigabe-Pipeline sichtbar — bitte als Einkäufer neu anmelden und „Offene Freigaben“ prüfen.`,
      );
    } else if (
      decision === "approved" &&
      data.order?.status === "approved"
    ) {
      setMessage(
        "Finale Einkaufsfreigabe gespeichert. ERP-Sync läuft bzw. kann bei Fehler erneut angestoßen werden.",
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
        <p className="muted">Bitte anmelden, um die Verkaufshistorie zu sehen.</p>
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
          <Link href="/dokumente" className="btn btn--ink">
            Dokumente
          </Link>
          <Link href="/anlagen" className="btn btn--ink">
            Anlagen
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

      {me.role === "REQUESTER" ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <p>
            Als <strong>Anforderer</strong> können Sie Angebote und Tickets
            anlegen, aber keine verbindlichen Bestellungen auslösen. Bitte
            Einkauf oder Firmen-Admin für die Annahme / den Checkout.
          </p>
        </div>
      ) : null}

      {me?.role === "COMPANY_ADMIN" ? (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Nutzer einladen</h2>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setMessage(null);
              const fd = new FormData(e.currentTarget);
              const res = await fetch("/api/account/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: String(fd.get("name") ?? ""),
                  email: String(fd.get("email") ?? ""),
                  password: String(fd.get("password") ?? ""),
                  role: String(fd.get("role") ?? "PURCHASING"),
                }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) {
                setError(data.error ?? "Einladung fehlgeschlagen");
                return;
              }
              setMessage("Nutzer angelegt");
              e.currentTarget.reset();
            }}
          >
            <label>
              Name
              <input name="name" required minLength={2} />
            </label>
            <label>
              E-Mail
              <input name="email" type="email" required />
            </label>
            <label>
              Initialpasswort
              <input name="password" type="password" required minLength={8} />
            </label>
            <label>
              Rolle
              <select name="role" defaultValue="PURCHASING">
                <option value="COMPANY_ADMIN">Firmen-Admin</option>
                <option value="PURCHASING">Einkauf</option>
                <option value="PRODUCTION_MANAGER">Produktionsleiter</option>
                <option value="REQUESTER">Anforderer</option>
              </select>
            </label>
            <button type="submit" className="btn btn--primary">
              Nutzer anlegen
            </button>
          </form>
        </div>
      ) : null}

      {stats ? (
        <section className="admin-stats" style={{ marginBottom: "1.25rem" }}>
          <div className="panel">
            <p className="eyebrow">Aufträge gesamt</p>
            <p className="admin-stat">{stats.orderCount}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">Offen / Freigabe</p>
            <p className="admin-stat">{stats.openCount}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">Im ERP bestätigt</p>
            <p className="admin-stat">{stats.confirmedCount}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">Verkaufssumme</p>
            <p className="admin-stat admin-stat--text">
              {formatMoney(stats.totalSpentCents)}
            </p>
          </div>
        </section>
      ) : null}

      {ephemeralDemo ? (
        <div className="panel" style={{ marginBottom: "1rem", borderColor: "#c45c26" }}>
          <p>
            <strong>Demo-Hinweis:</strong> Diese Umgebung speichert Aufträge in
            einer lokalen SQLite-Datei je Server-Instanz. Nach dem Wechsel
            Produktionsleiter → Einkauf kann ein Auftrag „verschwinden“, wenn
            eine andere Instanz antwortet. Für stabile Freigaben bitte lokal
            testen oder eine persistente Datenbank (Postgres/Turso) nutzen.
          </p>
        </div>
      ) : null}

      {message ? <div className="success-banner">{message}</div> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {quotes.length > 0 ? (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Angebote ({quotes.length})</h2>
          <div className="admin-table">
            {quotes.map((q) => (
              <div key={q.id} className="admin-row">
                <div>
                  <strong>{q.number}</strong>
                  <p className="muted">
                    {q.status}
                    {q.offeredTotalCents != null
                      ? ` · ${formatMoney(q.offeredTotalCents)}`
                      : ""}
                    {q.validUntil
                      ? ` · gültig bis ${new Date(q.validUntil).toLocaleDateString("de-DE")}`
                      : ""}
                  </p>
                  <p className="muted">
                    {q.items
                      .map((i) => `${i.name} × ${i.quantity}`)
                      .join(", ")}
                  </p>
                  {q.offeredNote ? (
                    <p className="muted">{q.offeredNote}</p>
                  ) : null}
                </div>
                <div className="admin-row__meta">
                  <span className="pill">{q.status}</span>
                  {q.status === "offered" && me.role !== "REQUESTER" ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={async () => {
                        setError(null);
                        setMessage(null);
                        const res = await fetch(`/api/quotes/${q.id}/accept`, {
                          method: "POST",
                        });
                        const data = (await res.json()) as {
                          error?: string;
                          order?: { number: string };
                        };
                        if (!res.ok) {
                          setError(data.error ?? "Annahme fehlgeschlagen");
                          return;
                        }
                        setMessage(
                          `Angebot angenommen → Auftrag ${data.order?.number ?? ""}`,
                        );
                        await load();
                      }}
                    >
                      Angebot annehmen
                    </button>
                  ) : null}
                  {q.status === "offered" && me.role === "REQUESTER" ? (
                    <span className="muted">Nur Einkauf/Admin</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tickets.length > 0 ? (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Support-Tickets ({tickets.length})</h2>
          <p className="muted">
            Neue Tickets unter{" "}
            <Link href="/retouren">Retouren / Service</Link>.
          </p>
          <div className="admin-table">
            {tickets.map((t) => (
              <div key={t.id} className="admin-row">
                <div>
                  <strong>{t.number}</strong>
                  <p className="muted">
                    {t.type} · {t.subject}
                  </p>
                </div>
                <span className="pill">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {pendingApprovals.length > 0 ? (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Ihre offenen Freigaben ({pendingApprovals.length})</h2>
          <p className="muted">
            Nur Aufträge, die Ihre aktuelle Rolle jetzt freigeben kann.
          </p>
          <div className="admin-table">
            {pendingApprovals.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onApprove={() => decide(order.id, "approved")}
                onReject={() => decide(order.id, "rejected")}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Ihre offenen Freigaben</h2>
          <p className="muted">
            Keine Freigabe für Ihre Rolle ({me.roleLabel}). Prüfen Sie die
            Pipeline unten — ggf. wartet der Auftrag auf eine andere Rolle.
          </p>
        </div>
      )}

      {waitingPipeline.length > 0 ? (
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2>Freigabe-Pipeline ({waitingPipeline.length})</h2>
          <p className="muted">
            Alle firmenweiten Aufträge in Freigabe — unabhängig vom Filter
            „Abgeschlossen“. So bleibt ein an den Einkauf übergebener Auftrag
            sichtbar.
          </p>
          <div className="admin-table">
            {waitingPipeline.map((order) => {
              const actor = nextActorLabel(order.status);
              return (
                <div key={order.id} className="admin-row history-row">
                  <div>
                    <div className="history-row__title">
                      <strong>{order.number}</strong>
                      <span className="muted">
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="muted">
                      Nächste Rolle: <strong>{actor ?? "—"}</strong>
                      {order.canApprove ? " · Sie können jetzt freigeben" : ""}
                    </p>
                    <Link href={`/account/orders/${order.id}`} className="text-btn">
                      Details
                    </Link>
                  </div>
                  <div className="admin-row__meta">
                    <span>{formatMoney(order.totalCents)}</span>
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
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="panel">
        <div className="history-toolbar">
          <div>
            <h2 style={{ margin: 0 }}>Verkaufshistorie</h2>
            <p className="muted" style={{ margin: "0.35rem 0 0" }}>
              Alle Bestellungen Ihrer Firma inkl. Rechnungen und ERP-Referenzen.
            </p>
          </div>
          <div className="history-filters">
            {(
              [
                ["all", "Alle"],
                ["open", "Offen"],
                ["history", "Abgeschlossen"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`filter-chip ${filter === value ? "is-active" : ""}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="history-search">
          Suche (Auftragsnr., Artikel, Rechnung)
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. PHT-2026 oder Arc Desk"
          />
        </label>

        <div className="admin-table" style={{ marginTop: "1rem" }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onApprove={
                order.canApprove ? () => decide(order.id, "approved") : undefined
              }
              onReject={
                order.canApprove ? () => decide(order.id, "rejected") : undefined
              }
            />
          ))}
          {orders.length === 0 ? (
            <p className="muted">Keine Einträge in der Verkaufshistorie.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onApprove,
  onReject,
}: {
  order: OrderRow;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const date = new Date(order.createdAt).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="admin-row history-row">
      <div>
        <div className="history-row__title">
          <strong>{order.number}</strong>
          <span className="muted">{date}</span>
        </div>
        <p className="muted">
          {statusLabel[order.status] ?? order.status}
          {order.requester
            ? ` · Besteller: ${order.requester.name} (${roleLabel(order.requester.role)})`
            : ""}
          {order.discountCode
            ? ` · Rabatt ${order.discountCode} (−${formatMoney(order.discountCents)})`
            : ""}
        </p>
        <p className="muted">
          {order.items
            .map((i) => `${i.name} × ${i.quantity}`)
            .join(", ")}
        </p>
        {order.invoice ? (
          <p className="muted">
            Rechnung {order.invoice.number} · {order.invoice.status} ·{" "}
            {formatMoney(order.invoice.amountCents)}
          </p>
        ) : null}
        {order.erpOrderId ? (
          <p className="muted">
            ERP Auftrag {order.erpOrderId}
            {order.erpInvoiceId ? ` · ERP RE ${order.erpInvoiceId}` : ""}
          </p>
        ) : null}
        <Link href={`/account/orders/${order.id}`} className="text-btn">
          Details ansehen
        </Link>
      </div>
      <div className="admin-row__meta">
        <span>{formatMoney(order.totalCents)}</span>
        <span
          className={`pill pill--${
            order.status.includes("awaiting")
              ? "pending"
              : order.status === "confirmed"
                ? "ok"
                : order.status
          }`}
        >
          {order.status}
        </span>
        {onApprove && onReject ? (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn--primary" onClick={onApprove}>
              Freigeben
            </button>
            <button type="button" className="btn btn--ink" onClick={onReject}>
              Ablehnen
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

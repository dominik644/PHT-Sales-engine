"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

type Company = {
  id: string;
  name: string;
  status: string;
  billingEmail: string;
  _count: { users: number; orders: number };
};

type Discount = {
  id: string;
  code: string;
  name: string;
  type: string;
  percentOff: number | null;
  amountOffCents: number | null;
  validFrom: string;
  validTo: string;
  active: boolean;
  company: { name: string } | null;
};

export function AdminB2BPanel() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "PHT-B2B-10",
    name: "B2B 10% Q3",
    type: "percent",
    percentOff: "10",
    amountOffCents: "",
    minSubtotalCents: "0",
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
  });

  async function load() {
    const [cRes, dRes] = await Promise.all([
      fetch("/api/admin/companies"),
      fetch("/api/admin/discounts"),
    ]);
    if (cRes.ok) {
      const data = (await cRes.json()) as { companies: Company[] };
      setCompanies(data.companies);
    }
    if (dRes.ok) {
      const data = (await dRes.json()) as { discounts: Discount[] };
      setDiscounts(data.discounts);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setCompanyStatus(companyId: string, status: string) {
    setMessage(null);
    const res = await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, status }),
    });
    if (!res.ok) {
      setMessage("Status-Update fehlgeschlagen");
      return;
    }
    setMessage(`Firma auf ${status} gesetzt`);
    await load();
    router.refresh();
  }

  async function createDiscount() {
    setMessage(null);
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        type: form.type,
        percentOff: form.type === "percent" ? Number(form.percentOff) : null,
        amountOffCents:
          form.type === "fixed" ? Number(form.amountOffCents) : null,
        minSubtotalCents: Number(form.minSubtotalCents || 0),
        validFrom: form.validFrom,
        validTo: form.validTo,
        active: true,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Rabatt konnte nicht angelegt werden");
      return;
    }
    setMessage("Rabatt gespeichert");
    await load();
  }

  return (
    <section className="admin-grid" style={{ marginTop: "1.25rem" }}>
      <div className="panel">
        <h2>B2B Firmen</h2>
        {message ? <p className="muted">{message}</p> : null}
        <div className="admin-table">
          {companies.map((company) => (
            <div key={company.id} className="admin-row">
              <div>
                <strong>{company.name}</strong>
                <p className="muted">
                  {company.billingEmail} · {company._count.users} Nutzer ·{" "}
                  {company._count.orders} Aufträge
                </p>
              </div>
              <div className="admin-row__meta">
                <span className={`pill pill--${company.status}`}>{company.status}</span>
                {company.status !== "active" ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setCompanyStatus(company.id, "active")}
                  >
                    Freischalten
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setCompanyStatus(company.id, "suspended")}
                  >
                    Sperren
                  </button>
                )}
              </div>
            </div>
          ))}
          {companies.length === 0 ? (
            <p className="muted">Noch keine Firmenregistrierungen.</p>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <h2>Rabatte mit Laufzeit</h2>
        <div className="form-grid" style={{ marginBottom: "1rem" }}>
          <label>
            Code
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </label>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label>
            Typ
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="percent">Prozent</option>
              <option value="fixed">Fixbetrag (Cent)</option>
            </select>
          </label>
          {form.type === "percent" ? (
            <label>
              Prozent
              <input
                value={form.percentOff}
                onChange={(e) =>
                  setForm((f) => ({ ...f, percentOff: e.target.value }))
                }
              />
            </label>
          ) : (
            <label>
              Betrag (Cent)
              <input
                value={form.amountOffCents}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amountOffCents: e.target.value }))
                }
              />
            </label>
          )}
          <label>
            Gültig von (ISO)
            <input
              value={form.validFrom}
              onChange={(e) =>
                setForm((f) => ({ ...f, validFrom: e.target.value }))
              }
            />
          </label>
          <label>
            Gültig bis (ISO)
            <input
              value={form.validTo}
              onChange={(e) =>
                setForm((f) => ({ ...f, validTo: e.target.value }))
              }
            />
          </label>
          <button type="button" className="btn btn--primary" onClick={createDiscount}>
            Rabatt anlegen
          </button>
        </div>

        <div className="admin-table">
          {discounts.map((d) => (
            <div key={d.id} className="admin-row">
              <div>
                <strong>{d.code}</strong>
                <p className="muted">
                  {d.name} ·{" "}
                  {d.type === "percent"
                    ? `${d.percentOff}%`
                    : formatMoney(d.amountOffCents ?? 0)}
                  {d.company ? ` · ${d.company.name}` : " · alle Firmen"}
                </p>
                <p className="muted">
                  {new Date(d.validFrom).toLocaleDateString("de-DE")} –{" "}
                  {new Date(d.validTo).toLocaleDateString("de-DE")}
                </p>
              </div>
              <span className={`pill pill--${d.active ? "ok" : "pending"}`}>
                {d.active ? "aktiv" : "inaktiv"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

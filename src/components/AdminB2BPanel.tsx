"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

type Company = {
  id: string;
  name: string;
  status: string;
  billingEmail: string;
  defaultPaymentTermId: string | null;
  defaultPaymentTerm: { id: string; name: string } | null;
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

type PaymentTerm = {
  id: string;
  code: string;
  name: string;
  description: string;
  depositPercent: number;
  balancePercent: number;
  balanceDueDays: number;
  active: boolean;
};

type Datasheet = {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  product: { name: string; sku: string };
};

type ProductOption = { id: string; name: string; sku: string };

export function AdminB2BPanel() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [datasheets, setDatasheets] = useState<Datasheet[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
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
  const [termForm, setTermForm] = useState({
    code: "50-50",
    name: "50/50",
    description: "50% bei Auftrag, 50% vor Lieferung",
    depositPercent: "50",
    balancePercent: "50",
    balanceDueDays: "0",
  });
  const [sheetForm, setSheetForm] = useState({
    productId: "",
    title: "Technisches Datenblatt",
    fileName: "",
    filePath: "",
  });

  async function load() {
    const [cRes, dRes, tRes, sRes, pRes] = await Promise.all([
      fetch("/api/admin/companies"),
      fetch("/api/admin/discounts"),
      fetch("/api/payment-terms"),
      fetch("/api/admin/datasheets"),
      fetch("/api/products"),
    ]);
    if (cRes.ok) {
      const data = (await cRes.json()) as { companies: Company[] };
      setCompanies(data.companies);
    }
    if (dRes.ok) {
      const data = (await dRes.json()) as { discounts: Discount[] };
      setDiscounts(data.discounts);
    }
    if (tRes.ok) {
      const data = (await tRes.json()) as { paymentTerms: PaymentTerm[] };
      setTerms(data.paymentTerms);
    }
    if (sRes.ok) {
      const data = (await sRes.json()) as { datasheets: Datasheet[] };
      setDatasheets(data.datasheets);
    }
    if (pRes.ok) {
      const data = (await pRes.json()) as {
        products: ProductOption[];
      };
      setProducts(data.products);
      if (data.products[0] && !sheetForm.productId) {
        setSheetForm((f) => ({ ...f, productId: data.products[0].id }));
      }
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function setCompanyTerm(companyId: string, defaultPaymentTermId: string) {
    const res = await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, defaultPaymentTermId }),
    });
    if (!res.ok) {
      setMessage("Zahlungsbedingung konnte nicht gesetzt werden");
      return;
    }
    setMessage("Standard-Zahlungsbedingung aktualisiert");
    await load();
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

  async function createTerm() {
    setMessage(null);
    const res = await fetch("/api/payment-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: termForm.code,
        name: termForm.name,
        description: termForm.description,
        depositPercent: Number(termForm.depositPercent),
        balancePercent: Number(termForm.balancePercent),
        balanceDueDays: Number(termForm.balanceDueDays),
        active: true,
        sortOrder: terms.length,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Zahlungsbedingung fehlgeschlagen");
      return;
    }
    setMessage("Zahlungsbedingung gespeichert");
    await load();
  }

  async function createDatasheet() {
    setMessage(null);
    const res = await fetch("/api/admin/datasheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: sheetForm.productId,
        title: sheetForm.title,
        fileName: sheetForm.fileName,
        filePath: sheetForm.filePath,
        mimeType: "application/pdf",
        sortOrder: 0,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Datenblatt fehlgeschlagen");
      return;
    }
    setMessage("Datenblatt verknüpft");
    await load();
  }

  return (
    <>
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
                  <label className="muted" style={{ display: "grid", gap: 4 }}>
                    Standard-Zahlungsbedingung
                    <select
                      value={company.defaultPaymentTermId ?? ""}
                      onChange={(e) =>
                        setCompanyTerm(company.id, e.target.value)
                      }
                    >
                      <option value="">— keine —</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-row__meta">
                  <span className={`pill pill--${company.status}`}>
                    {company.status}
                  </span>
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
            <button
              type="button"
              className="btn btn--primary"
              onClick={createDiscount}
            >
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

      <section className="admin-grid" style={{ marginTop: "1.25rem" }}>
        <div className="panel">
          <h2>Zahlungsbedingungen</h2>
          <div className="form-grid" style={{ marginBottom: "1rem" }}>
            <label>
              Code
              <input
                value={termForm.code}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, code: e.target.value }))
                }
              />
            </label>
            <label>
              Name
              <input
                value={termForm.name}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </label>
            <label>
              Beschreibung
              <input
                value={termForm.description}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </label>
            <label>
              Anzahlung %
              <input
                value={termForm.depositPercent}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, depositPercent: e.target.value }))
                }
              />
            </label>
            <label>
              Rest %
              <input
                value={termForm.balancePercent}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, balancePercent: e.target.value }))
                }
              />
            </label>
            <label>
              Rest fällig in Tagen (0 = Lieferung)
              <input
                value={termForm.balanceDueDays}
                onChange={(e) =>
                  setTermForm((f) => ({ ...f, balanceDueDays: e.target.value }))
                }
              />
            </label>
            <button type="button" className="btn btn--primary" onClick={createTerm}>
              Zahlungsbedingung anlegen
            </button>
          </div>
          <div className="admin-table">
            {terms.map((t) => (
              <div key={t.id} className="admin-row">
                <div>
                  <strong>
                    {t.name} ({t.depositPercent}/{t.balancePercent})
                  </strong>
                  <p className="muted">{t.description}</p>
                </div>
                <span className="pill pill--ok">{t.code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Datenblätter</h2>
          <div className="form-grid" style={{ marginBottom: "1rem" }}>
            <label>
              Produkt
              <select
                value={sheetForm.productId}
                onChange={(e) =>
                  setSheetForm((f) => ({ ...f, productId: e.target.value }))
                }
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titel
              <input
                value={sheetForm.title}
                onChange={(e) =>
                  setSheetForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </label>
            <label>
              Dateiname
              <input
                value={sheetForm.fileName}
                onChange={(e) =>
                  setSheetForm((f) => ({ ...f, fileName: e.target.value }))
                }
                placeholder="arc-desk-lamp.pdf"
              />
            </label>
            <label>
              Pfad unter /public
              <input
                value={sheetForm.filePath}
                onChange={(e) =>
                  setSheetForm((f) => ({ ...f, filePath: e.target.value }))
                }
                placeholder="datasheets/arc-desk-lamp.pdf"
              />
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={createDatasheet}
            >
              Datenblatt verknüpfen
            </button>
          </div>
          <div className="admin-table">
            {datasheets.map((s) => (
              <div key={s.id} className="admin-row">
                <div>
                  <strong>{s.title}</strong>
                  <p className="muted">
                    {s.product.name} · {s.filePath}
                  </p>
                </div>
                <a href={`/${s.filePath}`} className="text-btn" download={s.fileName}>
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

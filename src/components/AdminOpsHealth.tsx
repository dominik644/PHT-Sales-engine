"use client";

import { useCallback, useEffect, useState } from "react";

type OpsHealth = {
  ok: boolean;
  demoMode: boolean;
  database: string;
  erp: { provider: string; ok: boolean; detail: string };
  env: {
    ok: boolean;
    mode: string;
    errors: string[];
    warnings: string[];
  };
  queues: {
    openApprovals: number;
    failedOrPendingErp: number;
    pendingCompanies: number;
    openQuotes: number;
    openServices: number;
  };
  ts: string;
};

export function AdminOpsHealth() {
  const [data, setData] = useState<OpsHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ops-health", { cache: "no-store" });
      if (!res.ok) {
        setError("Ops-Health nicht ladbar");
        setData(null);
        return;
      }
      setData((await res.json()) as OpsHealth);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel" style={{ marginTop: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <p className="eyebrow">Produktiv-Härtung</p>
          <h2 style={{ margin: 0 }}>Ops Health</h2>
        </div>
        <button
          type="button"
          className="btn btn--ink btn--sm"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Lädt…" : "Aktualisieren"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {data ? (
        <div className="admin-stats" style={{ marginTop: "1rem" }}>
          <div className="panel">
            <p className="eyebrow">Gesamt</p>
            <p className="admin-stat">{data.ok ? "OK" : "DEGRADED"}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">Database</p>
            <p className="admin-stat">{data.database}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">ERP</p>
            <p className="admin-stat admin-stat--text">
              {data.erp.provider}: {data.erp.ok ? "ok" : "fail"}
            </p>
            <p className="muted">{data.erp.detail}</p>
          </div>
          <div className="panel">
            <p className="eyebrow">Demo-Modus</p>
            <p className="admin-stat">{data.demoMode ? "AN" : "AUS"}</p>
          </div>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="admin-stats" style={{ marginTop: "0.75rem" }}>
            <div className="panel">
              <p className="eyebrow">Offene Freigaben</p>
              <p className="admin-stat">{data.queues.openApprovals}</p>
            </div>
            <div className="panel">
              <p className="eyebrow">ERP pending/fail</p>
              <p className="admin-stat">{data.queues.failedOrPendingErp}</p>
            </div>
            <div className="panel">
              <p className="eyebrow">Firmen pending</p>
              <p className="admin-stat">{data.queues.pendingCompanies}</p>
            </div>
            <div className="panel">
              <p className="eyebrow">Quotes / Service</p>
              <p className="admin-stat admin-stat--text">
                {data.queues.openQuotes} / {data.queues.openServices}
              </p>
            </div>
          </div>

          {(data.env.errors.length > 0 || data.env.warnings.length > 0) && (
            <div style={{ marginTop: "0.75rem" }}>
              {data.env.errors.map((e) => (
                <p key={e} className="form-error">
                  Env: {e}
                </p>
              ))}
              {data.env.warnings.map((w) => (
                <p key={w} className="muted">
                  Hinweis: {w}
                </p>
              ))}
            </div>
          )}

          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Stand {new Date(data.ts).toLocaleString("de-DE")} · Runbook:{" "}
            <code>docs/ops-runbook.md</code>
          </p>
        </>
      ) : null}
    </section>
  );
}

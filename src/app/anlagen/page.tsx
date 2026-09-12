"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

type Asset = {
  id: string;
  serial: string;
  name: string;
  productId: string | null;
  installedAt: string | null;
  spareParts: Array<{
    id: string;
    qtyPerUnit: number;
    note: string;
    product: {
      id: string;
      slug: string;
      sku: string;
      name: string;
      priceCents: number;
      stock: number;
    };
  }>;
};

export default function AnlagenPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [serial, setSerial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (serial.trim()) params.set("serial", serial.trim());
    const res = await fetch(`/api/account/assets?${params.toString()}`);
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setError("Anlagen konnten nicht geladen werden");
      return;
    }
    const data = (await res.json()) as { assets: Asset[] };
    setAssets(data.assets);
    setAuthed(true);
    setError(null);
  }, [serial]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!authed) {
    return (
      <div className="section">
        <p className="muted">Bitte anmelden, um Ihre Anlagen zu sehen.</p>
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
          <p className="eyebrow">Service</p>
          <h1>Ihre Anlagen</h1>
          <p className="muted">
            Seriennummern und passende Ersatzteile (Vorbereitung BC-Anlagenstamm).
          </p>
        </div>
        <Link href="/dokumente" className="btn btn--ink">
          Dokumente
        </Link>
      </header>

      <form
        className="history-search"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <label>
          Suche nach Seriennummer
          <input
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="z.B. SN-2024-001"
          />
        </label>
        <button type="submit" className="btn btn--primary">
          Suchen
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-table" style={{ marginTop: "1.25rem" }}>
        {assets.map((asset) => (
          <div key={asset.id} className="panel" style={{ marginBottom: "1rem" }}>
            <strong>{asset.name}</strong>
            <p className="muted">
              Serie {asset.serial}
              {asset.installedAt
                ? ` · installiert ${new Date(asset.installedAt).toLocaleDateString("de-DE")}`
                : ""}
            </p>
            {asset.spareParts.length > 0 ? (
              <ul>
                {asset.spareParts.map((s) => (
                  <li key={s.id}>
                    <Link href={`/product/${s.product.slug}`}>{s.product.name}</Link>
                    <span className="muted">
                      {" "}
                      · {s.product.sku} · {s.qtyPerUnit}× ·{" "}
                      {formatMoney(s.product.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Keine Ersatzteile verknüpft.</p>
            )}
          </div>
        ))}
        {assets.length === 0 ? (
          <p className="muted">Keine Anlagen gefunden.</p>
        ) : null}
      </div>
    </div>
  );
}

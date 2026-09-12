import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kontakt" };

export default function KontaktPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Service</p>
        <h1>Kontakt</h1>
        <p className="muted">
          Demo-Kontaktdaten — bitte vor dem Live-Betrieb durch echte
          Standortdaten ersetzen und rechtlich prüfen lassen.
        </p>
      </div>
      <div className="panel store-panel store-surface">
        <p>
          <strong>PHT Deutschland Süd</strong> · Bad Tölz
          <br />
          <strong>PHT Deutschland Nord</strong> · Beckum
        </p>
        <p className="muted">
          E-Mail (Demo): verkauf@pht.example · Servicehotline: +49 (0)000 000000
        </p>
        <div className="cta-row">
          <Link href="/service" className="btn btn--primary">
            Montage / Wartung anfragen
          </Link>
          <Link href="/angebot" className="btn btn--ink">
            Angebot anfordern
          </Link>
        </div>
      </div>
    </div>
  );
}

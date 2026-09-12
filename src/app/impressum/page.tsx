import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Rechtliches</p>
        <h1>Impressum</h1>
        <p className="muted">
          Platzhalter für den Demo-Shop. Inhalt muss vor dem Live-Betrieb
          rechtlich prüfen lassen.
        </p>
      </div>
      <div className="panel store-panel store-surface">
        <p>
          <strong>PHT Group (Demo)</strong>
          <br />
          Beispieladresse · Bad Tölz / Beckum
          <br />
          E-Mail: demo@pht.example
        </p>
        <p className="muted">
          Diese Seite enthält keine verbindlichen Angaben. Bitte durch
          rechtsgeprüfte Impressumsangaben ersetzen.
        </p>
        <Link href="/" className="btn btn--ink">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

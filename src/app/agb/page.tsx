import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Rechtliches</p>
        <h1>Allgemeine Geschäftsbedingungen</h1>
        <p className="muted">
          Platzhalter-AGB für den Demo-Shop. Vor dem Live-Betrieb rechtlich
          prüfen lassen.
        </p>
      </div>
      <div className="panel store-panel store-surface">
        <p>
          Lieferungen, Preise (netto), Zahlungsbedingungen und Eigentumsvorbehalt
          richten sich im Live-Betrieb nach den aktuellen PHT-AGB und den
          kundenspezifischen Konditionen.
        </p>
        <p className="muted">
          Dieser Text ist nicht rechtsverbindlich und dient nur der Demo-Navigation.
        </p>
        <Link href="/" className="btn btn--ink">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

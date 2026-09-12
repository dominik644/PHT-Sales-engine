import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Rechtliches</p>
        <h1>Datenschutz</h1>
        <p className="muted">
          Platzhalter-Datenschutzerklärung. Vor dem Live-Betrieb rechtlich prüfen
          lassen.
        </p>
      </div>
      <div className="panel store-panel store-surface">
        <p>
          Wir verarbeiten im Demo-Betrieb nur die für Login, Bestellung und
          Support erforderlichen Daten. Es findet kein Live-Tracking statt.
        </p>
        <p className="muted">
          Cookie-Hinweis, Auftragsverarbeitung und Betroffenenrechte müssen vor
          Produktivgang ergänzt und rechtlich geprüft werden.
        </p>
        <Link href="/" className="btn btn--ink">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

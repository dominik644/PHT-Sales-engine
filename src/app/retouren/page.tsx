import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Retouren" };

export default function RetourenPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Service</p>
        <h1>Retouren</h1>
        <p className="muted">
          Platzhalter für das Retourenverfahren. Vor dem Live-Betrieb rechtlich
          prüfen lassen.
        </p>
      </div>
      <div className="panel store-panel store-surface">
        <p>
          Retouren von Geräten und Verbrauchsmaterialien erfolgen im Live-Betrieb
          nach Freigabe durch den PHT-Kundendienst und unter Beachtung der
          jeweiligen Liefer- und Garantiebedingungen.
        </p>
        <p className="muted">
          Dieser Text ist nicht rechtsverbindlich. Bitte Prozess, Fristen und
          Ansprechpartner vor Produktivgang festlegen.
        </p>
        <Link href="/kontakt" className="btn btn--primary">
          Kontakt aufnehmen
        </Link>
      </div>
    </div>
  );
}

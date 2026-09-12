import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "Wer kann bestellen?",
    a: "Registrierte B2B-Firmenkunden mit freigeschaltetem Konto.",
  },
  {
    q: "Wann sehe ich Preise?",
    a: "Listen- und Partnerpreise sind nach Login sichtbar.",
  },
  {
    q: "Wie funktioniert die Freigabe?",
    a: "Aufträge durchlaufen Produktionsleiter und Einkauf, bevor das ERP Auftrag und Rechnung anlegt.",
  },
  {
    q: "Gibt es Schnellbestellung?",
    a: "Ja — unter Schnellbestellung per SKU/CSV oder über die Angebotsanfrage.",
  },
];

export default function FaqPage() {
  return (
    <div className="section">
      <div className="page-intro">
        <p className="eyebrow">Hilfe</p>
        <h1>FAQ</h1>
        <p className="muted">Häufige Fragen zum Demo-B2B-Shop.</p>
      </div>
      <div className="panel store-panel store-surface">
        {FAQS.map((item) => (
          <div key={item.q} style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.35rem" }}>
              {item.q}
            </h2>
            <p className="muted">{item.a}</p>
          </div>
        ))}
        <p className="muted">
          Rechtliche Hinweise und Vertragsbedingungen bitte vor dem Live-Betrieb
          prüfen lassen.
        </p>
        <Link href="/kontakt" className="btn btn--primary">
          Kontakt
        </Link>
      </div>
    </div>
  );
}

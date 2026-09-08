import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo-Leitfaden",
  description: "Struktur und Ablauf der PHT Hygiene Demo-Version.",
};

const steps = [
  {
    n: "01",
    title: "Sortiment finden",
    href: "/shop",
    text: "Suche oder Kategorie wählen — wie in einem Fachshop.",
  },
  {
    n: "02",
    title: "Artikel prüfen",
    href: "/shop?category=Personalhygiene",
    text: "Art.-Nr., Bestand, Datenblatt, Menge, In den Warenkorb.",
  },
  {
    n: "03",
    title: "Warenkorb",
    href: "/warenkorb",
    text: "Positionen und Mengen prüfen, dann zur Kasse.",
  },
  {
    n: "04",
    title: "Kasse (B2B)",
    href: "/checkout",
    text: "Anmelden, Lieferadresse, Zahlungsbedingung, optional Rabatt.",
  },
  {
    n: "05",
    title: "Freigaben",
    href: "/account",
    text: "Produktionsleiter → Einkauf. Danach Mock-ERP: Auftrag + Rechnung.",
  },
];

export default function DemoPage() {
  return (
    <div className="demo-page">
      <header className="demo-page__head">
        <p className="eyebrow">PHT Hygiene</p>
        <h1>Demo-Leitfaden</h1>
        <p className="muted">
          Ziel dieser Version: die <strong>Struktur</strong> und den Bestellablauf
          absichern. Live erst, wenn dieser Weg stimmt.
        </p>
      </header>

      <ol className="demo-steps">
        {steps.map((step) => (
          <li key={step.n} className="demo-step">
            <span className="demo-step__n">{step.n}</span>
            <div>
              <h2>{step.title}</h2>
              <p className="muted">{step.text}</p>
              <Link href={step.href} className="btn btn--ink btn--sm">
                Öffnen
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <section className="panel store-panel demo- creds">
        <h2>Demo-Zugänge</h2>
        <ul>
          <li>
            <strong>Produktion:</strong> produktion@mueller-fertigung.example /
            demo-b2b-1234
          </li>
          <li>
            <strong>Einkauf:</strong> einkauf@mueller-fertigung.example /
            demo-b2b-1234
          </li>
          <li>
            <strong>Rabatt:</strong> PHT-B2B-10
          </li>
        </ul>
        <p className="muted">
          ERP läuft im Mock-Modus. Business Central kommt erst nach erfolgreicher
          Demo.
        </p>
      </section>
    </div>
  );
}

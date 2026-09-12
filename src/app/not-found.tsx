import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section empty-state">
      <p className="eyebrow">404</p>
      <h1>Artikel nicht gefunden</h1>
      <p className="muted">Dieser Artikel ist nicht im PHT Hygiene Sortiment.</p>
      <Link href="/shop" className="btn btn--primary">
        Zum Sortiment
      </Link>
    </div>
  );
}

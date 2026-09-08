import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="brand__mark brand__mark--small">PHT</p>
          <p className="muted">
            Hygiene B2B-Webshop — eigenständig, ERP-angebunden.
          </p>
        </div>
        <div className="site-footer__links">
          <Link href="/shop">Sortiment</Link>
          <Link href="/warenkorb">Warenkorb</Link>
          <Link href="/account">Mein Konto</Link>
          <Link href="/demo">Demo-Leitfaden</Link>
          <Link href="/login">Anmelden</Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="brand__mark brand__mark--small">PHT</p>
          <p className="muted">
            Eigenständiger B2B-Webshop — unabhängig vom Mastertool.
          </p>
        </div>
        <div className="site-footer__links">
          <Link href="/shop">Shop all</Link>
          <Link href="/account">Historie</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </footer>
  );
}

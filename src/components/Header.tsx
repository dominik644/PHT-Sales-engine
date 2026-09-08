"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";

const categoryLinks = [
  { href: "/shop?category=Personalhygiene", label: "Personalhygiene" },
  { href: "/shop?category=Zutritt", label: "Zutritt" },
  { href: "/shop?category=Sohlenhygiene", label: "Sohlenhygiene" },
  { href: "/shop?category=Desinfektion", label: "Desinfektion" },
  { href: "/shop?category=Reinigung", label: "Reinigung" },
  { href: "/shop?category=Verbrauchsmaterial", label: "Verbrauch" },
  { href: "/shop?category=Service", label: "Service" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const [signedIn, setSignedIn] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: unknown }) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, [pathname]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="topbar__inner">
          <span>PHT Hygiene · B2B-Fachhandel</span>
          <span>Freigabe: Produktionsleiter → Einkauf</span>
          <span>Auftrag & Rechnung via ERP</span>
        </div>
      </div>

      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="PHT Hygiene Startseite">
          <span className="brand__mark">PHT</span>
          <span className="brand__sub">Hygiene</span>
        </Link>

        <form className="site-search" onSubmit={onSearch} role="search">
          <label className="sr-only" htmlFor="site-q">
            Produktsuche
          </label>
          <input
            id="site-q"
            type="search"
            placeholder="Artikel, Art.-Nr. oder Kategorie suchen…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn--ink">
            Suchen
          </button>
        </form>

        <div className="header-actions">
          <Link href={signedIn ? "/account" : "/login"} className="header-link">
            {signedIn ? "Mein Konto" : "Anmelden"}
          </Link>
          <Link href="/register" className="header-link header-link--muted">
            Registrieren
          </Link>
          <button type="button" className="cart-trigger" onClick={openCart}>
            <span>Warenkorb</span>
            <span className="cart-trigger__count" data-empty={itemCount === 0}>
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="category-nav" aria-label="Kategorien">
        <div className="category-nav__inner">
          <Link
            href="/shop"
            className={pathname === "/shop" ? "is-active" : undefined}
          >
            Alle Artikel
          </Link>
          {categoryLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/warenkorb" className="category-nav__cart-hint">
            Warenkorb prüfen
            {itemCount > 0 ? ` · ${itemCount}` : ""}
          </Link>
        </div>
      </nav>
    </header>
  );
}

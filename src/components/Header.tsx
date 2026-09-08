"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/checkout", label: "Checkout" },
  { href: "/account", label: "Konto" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: unknown }) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="PHT home">
          <span className="brand__mark">PHT</span>
          <span className="brand__sub">B2B Sales Engine</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
          {!signedIn ? (
            <Link href="/login" className={pathname === "/login" ? "is-active" : undefined}>
              Login
            </Link>
          ) : null}
        </nav>

        <button type="button" className="cart-trigger" onClick={openCart}>
          <span>Cart</span>
          <span className="cart-trigger__count" data-empty={itemCount === 0}>
            {itemCount}
          </span>
        </button>
      </div>
    </header>
  );
}

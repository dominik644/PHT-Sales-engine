"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/checkout", label: "Checkout" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="PHT home">
          <span className="brand__mark">PHT</span>
          <span className="brand__sub">Sales Engine</span>
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

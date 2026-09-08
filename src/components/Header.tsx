"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import { PHT_NAV } from "@/lib/taxonomy";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const [signedIn, setSignedIn] = useState(false);
  const [q, setQ] = useState("");
  const currentCategory = searchParams.get("category") ?? "";

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

  function isActive(href: string) {
    if (href === "/shop") {
      return pathname === "/shop" && !currentCategory;
    }
    if (!href.includes("category=")) return pathname === href;
    const cat = decodeURIComponent(href.split("category=")[1] ?? "");
    return pathname === "/shop" && currentCategory === cat;
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="topbar__inner">
          <span>DEMO-VERSION · Struktur wie pht.group</span>
          <span>Ihr Partner für Hygiene und Technologie</span>
          <span>ERP: Mock</span>
        </div>
      </div>

      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="PHT Group Startseite">
          <Image
            src="/brand/logo.webp"
            alt="PHT"
            width={120}
            height={40}
            className="brand__logo"
            priority
          />
        </Link>

        <nav className="site-nav" aria-label="Hauptnavigation">
          {PHT_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <form
            className="site-search site-search--compact"
            onSubmit={onSearch}
            role="search"
          >
            <label className="sr-only" htmlFor="site-q">
              Produktsuche
            </label>
            <input
              id="site-q"
              type="search"
              placeholder="Suchen…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <Link href={signedIn ? "/account" : "/login"} className="header-link">
            {signedIn ? "Konto" : "Anmelden"}
          </Link>
          <button type="button" className="cart-trigger" onClick={openCart}>
            <span>Warenkorb</span>
            <span className="cart-trigger__count" data-empty={itemCount === 0}>
              {itemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

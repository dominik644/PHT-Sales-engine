"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, removeItem, itemCount, clearCart } =
    useCart();

  return (
    <div className="cart-page">
      <header className="checkout-steps" aria-label="Bestellschritte">
        <span className="is-active">1. Warenkorb</span>
        <span>2. Kasse</span>
        <span>3. Bestätigung</span>
      </header>

      <div className="cart-page__head">
        <div>
          <p className="eyebrow">Einkauf</p>
          <h1>Warenkorb</h1>
          <p className="muted">{itemCount} Position(en)</p>
        </div>
        {itemCount > 0 ? (
          <button type="button" className="text-btn" onClick={clearCart}>
            Warenkorb leeren
          </button>
        ) : null}
      </div>

      {itemCount === 0 ? (
        <div className="empty-state">
          <p>Noch keine Artikel im Warenkorb.</p>
          <Link href="/shop" className="btn btn--primary">
            Sortiment durchsuchen
          </Link>
        </div>
      ) : (
        <div className="cart-page__grid">
          <ul className="cart-table">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="cart-table__row">
                <div className="cart-table__media">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="96px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="cart-table__info">
                  <Link href={`/product/${product.slug}`}>{product.name}</Link>
                  <p className="muted">{product.priceCents == null ? "—" : formatMoney(product.priceCents)} / Stück</p>
                </div>
                <div className="qty">
                  <button
                    type="button"
                    aria-label="Menge verringern"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Menge erhöhen"
                    onClick={() => setQuantity(product.id, quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <strong>{(product.priceCents == null ? "—" : formatMoney(product.priceCents * quantity))}</strong>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => removeItem(product.id)}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>

          <aside className="cart-summary panel">
            <h2>Zusammenfassung</h2>
            <div className="cart-subtotal">
              <span>Zwischensumme</span>
              <strong>{formatMoney(subtotalCents)}</strong>
            </div>
            <p className="muted">
              Rabattcodes und Zahlungsbedingungen wählen Sie an der Kasse.
              Bestellungen durchlaufen die Freigabe Produktionsleiter → Einkauf.
            </p>
            <Link href="/checkout" className="btn btn--primary btn--block">
              Zur Kasse
            </Link>
            <Link href="/shop" className="btn btn--ink btn--block">
              Weiter einkaufen
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

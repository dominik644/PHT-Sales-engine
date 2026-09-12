"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotalCents,
    setQuantity,
    removeItem,
    itemCount,
  } = useCart();

  return (
    <>
      <div
        className={`cart-scrim ${isOpen ? "is-open" : ""}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
        hidden={!isOpen}
      />
      <aside
        className={`cart-drawer ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Warenkorb"
        inert={!isOpen ? true : undefined}
      >
        <div className="cart-drawer__head">
          <h2>Warenkorb</h2>
          <button type="button" className="text-btn" onClick={closeCart}>
            Schließen
          </button>
        </div>

        {itemCount === 0 ? (
          <div className="cart-empty">
            <p>Ihr Warenkorb ist leer.</p>
            <Link href="/shop" className="btn btn--primary" onClick={closeCart}>
              Zum Sortiment
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cart-line">
                  <div className="cart-line__media">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="72px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="cart-line__body">
                    <div className="cart-line__top">
                      <Link href={`/product/${product.slug}`} onClick={closeCart}>
                        {product.name}
                      </Link>
                      <span>{(product.priceCents == null ? "—" : formatMoney(product.priceCents * quantity))}</span>
                    </div>
                    <div className="cart-line__controls">
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
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => removeItem(product.id)}
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-drawer__foot">
              <div className="cart-subtotal">
                <span>Zwischensumme (netto)</span>
                <strong>{formatMoney(subtotalCents)}</strong>
              </div>
              <p className="muted cart-hint">
                Rabatte und Zahlungsbedingungen werden an der Kasse geprüft.
              </p>
              <Link
                href="/warenkorb"
                className="btn btn--ink btn--block"
                onClick={closeCart}
              >
                Warenkorb öffnen
              </Link>
              <Link
                href="/checkout"
                className="btn btn--primary btn--block"
                onClick={closeCart}
              >
                Zur Kasse
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

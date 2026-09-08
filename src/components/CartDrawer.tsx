"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    lines,
    subtotal,
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
      />
      <aside
        className={`cart-drawer ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="cart-drawer__head">
          <h2>Your cart</h2>
          <button type="button" className="text-btn" onClick={closeCart}>
            Close
          </button>
        </div>

        {itemCount === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn btn--primary" onClick={closeCart}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map(({ product, quantity, lineTotal }) => (
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
                      <span>{formatPrice(lineTotal)}</span>
                    </div>
                    <div className="cart-line__controls">
                      <div className="qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
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
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-drawer__foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link
                href="/checkout"
                className="btn btn--primary btn--block"
                onClick={closeCart}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

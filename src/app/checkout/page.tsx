"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { lines, subtotal, clearCart, itemCount } = useCart();
  const [placed, setPlaced] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="checkout" style={{ display: "block", maxWidth: 640 }}>
        <div className="success-banner">
          <p className="eyebrow">Order confirmed</p>
          <h1 style={{ fontFamily: "var(--font-display)", margin: "0.35rem 0" }}>
            Thanks — your PHT order is in.
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            This demo checkout does not process payments. Your cart has been
            cleared so you can keep browsing.
          </p>
        </div>
        <Link href="/shop" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">Checkout</p>
        <h1>Almost there</h1>
        <p className="muted">Enter shipping details to place a demo order.</p>
      </header>

      {itemCount === 0 ? (
        <div className="section" style={{ paddingTop: "1rem" }}>
          <div className="panel">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn btn--primary">
              Browse products
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout">
          <form className="panel" onSubmit={handleSubmit}>
            <h2>Shipping</h2>
            <div className="form-grid">
              <label>
                Full name
                <input name="name" required autoComplete="name" />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Address
                <input name="address" required autoComplete="street-address" />
              </label>
              <label>
                City
                <input name="city" required autoComplete="address-level2" />
              </label>
              <label>
                Postal code
                <input name="postal" required autoComplete="postal-code" />
              </label>
              <button type="submit" className="btn btn--primary btn--block">
                Place order · {formatPrice(subtotal)}
              </button>
            </div>
          </form>

          <aside className="panel">
            <h2>Order summary</h2>
            {lines.map(({ product, quantity, lineTotal }) => (
              <div key={product.id} className="summary-line">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

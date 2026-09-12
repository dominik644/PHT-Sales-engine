"use client";

import { useState } from "react";
import { useCart, type CartProductSnapshot } from "@/context/CartContext";

export function AddToCartButton({
  product,
  label = "In den Warenkorb",
}: {
  product: CartProductSnapshot;
  label?: string;
}) {
  const { addItem, openCart } = useCart();
  const minQty = Math.max(1, product.minOrderQty ?? 1);
  const [qty, setQty] = useState(minQty);

  return (
    <div className="add-to-cart">
      <div className="qty qty--lg">
        <button
          type="button"
          aria-label="Menge verringern"
          onClick={() => setQty((q) => Math.max(minQty, q - 1))}
        >
          −
        </button>
        <span>{qty}</span>
        <button
          type="button"
          aria-label="Menge erhöhen"
          onClick={() => setQty((q) => q + 1)}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          const ok = addItem(product, qty);
          if (ok) openCart();
        }}
        disabled={product.priceCents == null}
      >
        {label}
      </button>
    </div>
  );
}

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
  const [qty, setQty] = useState(1);

  return (
    <div className="add-to-cart">
      <div className="qty qty--lg">
        <button
          type="button"
          aria-label="Menge verringern"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
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
          addItem(product, qty);
          openCart();
        }}
      >
        {label}
      </button>
    </div>
  );
}

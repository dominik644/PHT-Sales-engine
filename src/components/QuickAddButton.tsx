"use client";

import { useCart, type CartProductSnapshot } from "@/context/CartContext";

export function QuickAddButton({ product }: { product: CartProductSnapshot }) {
  const { addItem, openCart } = useCart();

  return (
    <button
      type="button"
      className="btn btn--primary btn--sm"
      onClick={() => {
        addItem(product, 1);
        openCart();
      }}
    >
      In den Warenkorb
    </button>
  );
}

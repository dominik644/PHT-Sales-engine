"use client";

import { useCart, type CartProductSnapshot } from "@/context/CartContext";

export function QuickAddButton({ product }: { product: CartProductSnapshot }) {
  const { addItem, openCart } = useCart();
  const canAdd =
    product.priceCents != null && Number.isFinite(product.priceCents);

  return (
    <button
      type="button"
      className="btn btn--primary btn--sm"
      disabled={!canAdd}
      onClick={() => {
        if (!canAdd) return;
        const ok = addItem(product, Math.max(1, product.minOrderQty ?? 1));
        if (ok) openCart();
      }}
    >
      In den Warenkorb
    </button>
  );
}

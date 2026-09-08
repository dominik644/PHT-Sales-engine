"use client";

import { useCart, type CartProductSnapshot } from "@/context/CartContext";

export function AddToCartButton({
  product,
  label = "Add to cart",
}: {
  product: CartProductSnapshot;
  label?: string;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => addItem(product)}
    >
      {label}
    </button>
  );
}

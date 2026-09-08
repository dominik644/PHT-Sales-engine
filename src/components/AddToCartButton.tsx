"use client";

import { useCart } from "@/context/CartContext";

export function AddToCartButton({
  productId,
  label = "Add to cart",
}: {
  productId: string;
  label?: string;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => addItem(productId)}
    >
      {label}
    </button>
  );
}

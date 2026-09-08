import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full PHT collection.",
};

export default function ShopPage() {
  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">Catalog</p>
        <h1>Shop</h1>
        <p className="muted" style={{ maxWidth: "42ch" }}>
          Eight products, one sales engine. Filter by browsing — every item ships
          from the same warehouse.
        </p>
      </header>
      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

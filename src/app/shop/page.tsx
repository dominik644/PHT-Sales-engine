import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { listActiveProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full PHT collection.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listActiveProducts();

  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">Catalog</p>
        <h1>Shop</h1>
        <p className="muted" style={{ maxWidth: "42ch" }}>
          Products and stock are synced from your ERP. Prices shown include the
          current warehouse quantity.
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

import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { StoreHero } from "@/components/StoreHero";
import { listActiveProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full PHT collection.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listActiveProducts();
  const first = products[0];

  return (
    <>
      <StoreHero
        headline="Goods that earn their place."
        support="Eigenständiger B2B-Webshop: Registrierung, Freigaben (Produktionsleiter → Einkauf), Rabatte mit Laufzeit — Aufträge und Rechnungen entstehen im ERP."
        primaryHref="/shop"
        primaryLabel="Shop the collection"
        secondaryHref={first ? `/product/${first.slug}` : "/register"}
        secondaryLabel={first ? `View ${first.name}` : "Registrieren"}
      />

      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow">Collection</p>
            <h2>Selected for daily use</h2>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

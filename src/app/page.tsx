import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { StoreHero } from "@/components/StoreHero";
import { listActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listActiveProducts();
  const featured = products.slice(0, 4);
  const first = products[0];

  return (
    <>
      <StoreHero
        headline="Goods that earn their place."
        support="B2B Sales Engine: Registrierung, Freigaben (Produktionsleiter → Einkauf), Rabatte mit Laufzeit — Aufträge und Rechnungen entstehen im ERP."
        secondaryHref={first ? `/product/${first.slug}` : undefined}
        secondaryLabel={first ? `View ${first.name}` : undefined}
      />

      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Selected for daily use</h2>
          </div>
          <Link href="/shop" className="btn btn--ink">
            View all
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listActiveProducts();
  const featured = products.slice(0, 4);
  const first = products[0];

  return (
    <>
      <section className="hero" aria-label="PHT hero">
        <div className="hero__media">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
            alt="Bright modern interior with curated furniture and lighting"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero__veil" />
        </div>
        <div className="hero__content">
          <p className="hero__brand">PHT</p>
          <h1 className="hero__headline">Goods that earn their place.</h1>
          <p className="hero__support">
            Secure sales engine with live inventory and ERP sync — priced
            clearly, shipped from your warehouse system.
          </p>
          <div className="cta-row">
            <Link href="/shop" className="btn btn--primary">
              Shop the collection
            </Link>
            {first ? (
              <Link href={`/product/${first.slug}`} className="btn btn--ghost">
                View {first.name}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

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

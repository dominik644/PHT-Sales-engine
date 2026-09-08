import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function HomePage() {
  const featured = products.slice(0, 4);

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
            A focused sales engine for lighting, audio, furniture, and home tech —
            priced clearly, shipped fast.
          </p>
          <div className="cta-row">
            <Link href="/shop" className="btn btn--primary">
              Shop the collection
            </Link>
            <Link href="/product/arc-desk-lamp" className="btn btn--ghost">
              View Arc Lamp
            </Link>
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

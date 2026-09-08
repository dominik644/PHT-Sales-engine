import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="product-tile">
      <Link href={`/product/${product.slug}`} className="product-tile__link">
        <div
          className="product-tile__media"
          style={{ backgroundColor: product.accent }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="product-tile__meta">
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="muted">{product.tagline}</p>
          <p className="price">{formatMoney(product.priceCents)}</p>
        </div>
      </Link>
    </article>
  );
}

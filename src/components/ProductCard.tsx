import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { QuickAddButton } from "@/components/QuickAddButton";

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="product-tile">
      <Link href={`/product/${product.slug}`} className="product-tile__media-link">
        <div
          className="product-tile__media"
          style={{ backgroundColor: product.accent }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </Link>
      <div className="product-tile__meta">
        <p className="eyebrow">
          {product.category} · {product.sku}
        </p>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="muted">{product.tagline}</p>
        <div className="product-tile__buy">
          <p className="price">{formatMoney(product.priceCents)}</p>
          {product.stock > 0 ? (
            <QuickAddButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                image: product.image,
              }}
            />
          ) : (
            <span className="stock-badge stock-badge--out">Nicht lieferbar</span>
          )}
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/catalog";
import { formatNet } from "@/lib/pricing-display";
import { QuickAddButton } from "@/components/QuickAddButton";

export function ProductCard({
  product,
  showPrice = false,
}: {
  product: StoreProduct;
  showPrice?: boolean;
}) {
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
        {product.datasheets.length > 0 ? (
          <p className="product-tile__docs">
            {product.datasheets.map((sheet) => (
              <a
                key={sheet.id}
                href={`/api/datasheets/${sheet.id}/download`}
                className="datasheet-chip"
                download={sheet.fileName}
              >
                Datenblatt
              </a>
            ))}
          </p>
        ) : null}
        <div className="product-tile__buy">
          <p className="price">
            {showPrice ? formatNet(product.priceCents) : "Preis nach Login"}
          </p>
          {product.stock > 0 ? (
            showPrice ? (
              <QuickAddButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  sku: product.sku,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: product.image,
                  minOrderQty: product.minOrderQty,
                }}
              />
            ) : (
              <Link href="/login" className="btn btn--ink btn--sm">
                Anmelden
              </Link>
            )
          ) : (
            <span className="stock-badge stock-badge--out">Nicht lieferbar</span>
          )}
        </div>
      </div>
    </article>
  );
}

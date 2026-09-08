import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, listActiveProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Artikel" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await listActiveProducts({ category: product.category }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pdp">
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href="/">Start</Link>
        <span>/</span>
        <Link href="/shop">Sortiment</Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <article className="product-detail store-surface">
        <div
          className="product-detail__media"
          style={{ backgroundColor: product.accent }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="product-detail__copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="sku-line">
            Art.-Nr. <strong>{product.sku}</strong>
          </p>
          <p className="lead muted">{product.tagline}</p>
          <p className="price">{formatMoney(product.priceCents)}</p>
          <p className="muted">{product.description}</p>
          <p className="stock-line">
            {product.stock > 0 ? (
              <>
                <span className="stock-badge">Auf Lager</span>
                <span>{product.stock} Stück verfügbar</span>
              </>
            ) : (
              <span className="stock-badge stock-badge--out">Nicht lieferbar</span>
            )}
          </p>

          {product.datasheets.length > 0 ? (
            <div className="datasheet-list">
              <p className="eyebrow">Dokumente</p>
              <ul>
                {product.datasheets.map((sheet) => (
                  <li key={sheet.id}>
                    <a
                      href={`/${sheet.filePath}`}
                      download={sheet.fileName}
                      className="btn btn--ink btn--sm"
                    >
                      {sheet.title} (PDF)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="product-detail__actions">
            {product.stock > 0 ? (
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: product.image,
                }}
              />
            ) : (
              <button type="button" className="btn btn--ink" disabled>
                Nicht lieferbar
              </button>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="section section--tight">
          <div className="section__head">
            <div>
              <p className="eyebrow">Ähnliche Artikel</p>
              <h2>Aus {product.category}</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

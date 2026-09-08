import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
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

  return (
    <article className="product-detail">
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
        <p className="lead muted">{product.tagline}</p>
        <p className="price">{formatMoney(product.priceCents)}</p>
        <p className="muted">{product.description}</p>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          In stock: <strong>{product.stock}</strong> · SKU {product.sku}
        </p>
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
              Out of stock
            </button>
          )}
          <Link href="/shop" className="btn btn--ink">
            Back to shop
          </Link>
        </div>
      </div>
    </article>
  );
}

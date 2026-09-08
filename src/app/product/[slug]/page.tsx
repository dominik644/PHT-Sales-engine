import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice, getProduct, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
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
  const product = getProduct(slug);
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
        <p className="price">{formatPrice(product.price)}</p>
        <p className="muted">{product.description}</p>
        <div className="product-detail__actions">
          <AddToCartButton productId={product.id} />
          <Link href="/shop" className="btn btn--ink">
            Back to shop
          </Link>
        </div>
      </div>
    </article>
  );
}

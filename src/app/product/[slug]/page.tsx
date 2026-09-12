import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { getFreshSessionUser } from "@/lib/b2b-auth";
import { getProductBySlug, listActiveProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { formatNet } from "@/lib/pricing-display";
import { applyCompanyListPrices, resolveUnitPrice } from "@/lib/pricing";
import { formatDelivery } from "@/lib/pricing-display";

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
  let product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await getFreshSessionUser();
  const showPrice = Boolean(session);
  const companyId =
    session?.companyStatus === "active" ? session.companyId : null;

  if (showPrice && companyId) {
    const priced = await resolveUnitPrice({
      productId: product.id,
      quantity: Math.max(1, product.minOrderQty),
      companyId,
    });
    product = { ...product, priceCents: priced.unitCents, price: priced.unitCents / 100 };
  }

  let related = (await listActiveProducts({ category: product.category }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  if (showPrice && companyId) {
    related = await applyCompanyListPrices(related, companyId);
  }

  const dims = [
    product.lengthMm != null ? `${product.lengthMm} mm L` : null,
    product.widthMm != null ? `${product.widthMm} mm B` : null,
    product.heightMm != null ? `${product.heightMm} mm H` : null,
  ].filter(Boolean);

  const gallery = product.images.length > 1 ? product.images : [product.image];

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
        <ProductGallery
          images={gallery}
          alt={product.name}
          accent={product.accent}
        />
        <div className="product-detail__copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="sku-line">
            Art.-Nr. <strong>{product.sku}</strong>
            {product.manufacturerSku ? (
              <>
                {" "}
                · Hersteller-Nr. <strong>{product.manufacturerSku}</strong>
              </>
            ) : null}
          </p>
          <p className="lead muted">{product.tagline}</p>
          <p className="price">
            {showPrice ? formatNet(product.priceCents) : "Preis nach Login"}
          </p>
          {showPrice && product.priceTiers.length > 0 ? (
            <p className="muted">
              Staffelpreise:{" "}
              {product.priceTiers
                .map((t) => `ab ${t.qtyFrom} Stk. ${formatMoney(t.unitCents)}`)
                .join(" · ")}
            </p>
          ) : null}
          <p className="muted">{product.description}</p>
          {product.purpose ? (
            <p>
              <strong>Verwendungszweck:</strong> {product.purpose}
            </p>
          ) : null}
          <p className="muted">
            {formatDelivery(
              product.deliveryDaysInStock,
              product.deliveryDaysOutOfStock,
              product.stock,
            )}
            {" · "}
            Mindestbestellmenge: {product.minOrderQty}
          </p>
          {dims.length || product.weightKg != null ? (
            <p className="muted">
              {dims.length ? `Maße: ${dims.join(" × ")}` : null}
              {dims.length && product.weightKg != null ? " · " : null}
              {product.weightKg != null ? `Gewicht: ${product.weightKg} kg` : null}
            </p>
          ) : null}
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
              <h2 className="datasheet-list__title">Datenblätter herunterladen</h2>
              <p className="muted datasheet-list__hint">
                Technische Unterlagen und Sicherheitsdatenblätter zu diesem Gerät.
              </p>
              <ul>
                {product.datasheets.map((sheet) => (
                  <li key={sheet.id}>
                    <a
                      href={`/api/datasheets/${sheet.id}/download`}
                      className="btn btn--primary btn--sm datasheet-download"
                      download={sheet.fileName}
                    >
                      {sheet.title} · PDF laden
                    </a>
                    <a
                      href={`/${sheet.filePath}`}
                      className="datasheet-preview"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Vorschau
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="datasheet-list datasheet-list--empty">
              <p className="eyebrow">Dokumente</p>
              <p className="muted">
                Für diesen Artikel ist noch kein Datenblatt hinterlegt.
              </p>
            </div>
          )}

          {product.spareParts.length > 0 ? (
            <div className="datasheet-list">
              <p className="eyebrow">Ersatzteile</p>
              <h2 className="datasheet-list__title">Passende Teile</h2>
              <ul>
                {product.spareParts.map((spare) => (
                  <li key={spare.id}>
                    <Link href={`/product/${spare.product.slug}`}>
                      {spare.product.name}
                    </Link>
                    <span className="muted">
                      {" "}
                      · {spare.product.sku} · {spare.qtyPerUnit}× empfohlen
                      {spare.note ? ` — ${spare.note}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="product-detail__actions">
            {product.stock <= 0 ? (
              <button type="button" className="btn btn--ink" disabled>
                Nicht lieferbar
              </button>
            ) : showPrice ? (
              <AddToCartButton
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
              <Link href="/login" className="btn btn--primary">
                Anmelden zum Bestellen
              </Link>
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
              <ProductCard key={p.id} product={p} showPrice={showPrice} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

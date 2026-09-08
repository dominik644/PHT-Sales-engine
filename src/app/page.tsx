import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { StoreHero } from "@/components/StoreHero";
import { listActiveProducts, listCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    listActiveProducts({ sort: "name" }),
    listCategories(),
  ]);
  const featured = products.slice(0, 4);

  return (
    <>
      <StoreHero
        headline="Hygienetechnik für den professionellen Einkauf."
        support="B2B-Sortiment für Lebensmittel, Pharma und Gemeinschaftsverpflegung — mit Freigabeprozess, Datenblättern und ERP-Auftrag inkl. Rechnung."
        primaryLabel="Sortiment öffnen"
        secondaryHref="/register"
        secondaryLabel="Firma registrieren"
      />

      <section className="trust-strip">
        <div className="trust-strip__inner">
          <p>
            <strong>Schnell finden</strong>
            <span>Suche nach Artikel & Art.-Nr.</span>
          </p>
          <p>
            <strong>Sicher bestellen</strong>
            <span>Freigabe Produktionsleiter → Einkauf</span>
          </p>
          <p>
            <strong>Klar abrechnen</strong>
            <span>Zahlungsbedingungen & ERP-Rechnung</span>
          </p>
          <p>
            <strong>Technik greifbar</strong>
            <span>Datenblätter direkt am Artikel</span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow">Kategorien</p>
            <h2>Direkt ins Sortiment</h2>
          </div>
          <Link href="/shop" className="btn btn--ink">
            Alle Artikel
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="category-tile"
            >
              <span className="category-tile__name">{cat.name}</span>
              <span className="category-tile__count">{cat.count} Artikel</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <div className="section__head">
          <div>
            <p className="eyebrow">Empfohlen</p>
            <h2>Aktuelle Artikel</h2>
          </div>
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

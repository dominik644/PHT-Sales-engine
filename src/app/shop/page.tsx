import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listActiveProducts, listCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Sortiment",
  description:
    "PHT Hygiene B2B-Sortiment: Personalhygiene, Desinfektion, Reinigung und mehr.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sort?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const category = sp.category?.trim() || "";
  const sort =
    sp.sort === "price-asc" || sp.sort === "price-desc" ? sp.sort : "name";

  const [products, categories] = await Promise.all([
    listActiveProducts({ q, category, sort }),
    listCategories(),
  ]);

  const title = category || (q ? `Suche: ${q}` : "Alle Artikel");

  return (
    <div className="shop-layout">
      <aside className="shop-filters" aria-label="Filter">
        <h2>Kategorien</h2>
        <ul>
          <li>
            <Link
              href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
              className={!category ? "is-active" : undefined}
            >
              Alle <span>{categories.reduce((n, c) => n + c.count, 0)}</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/shop?category=${encodeURIComponent(cat.name)}${
                  q ? `&q=${encodeURIComponent(q)}` : ""
                }`}
                className={category === cat.name ? "is-active" : undefined}
              >
                {cat.name} <span>{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="shop-main">
        <header className="shop-main__head">
          <div>
            <p className="eyebrow">Sortiment</p>
            <h1>{title}</h1>
            <p className="muted">{products.length} Artikel</p>
          </div>
          <form className="shop-sort" method="get">
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            <label htmlFor="sort">Sortierung</label>
            <select id="sort" name="sort" defaultValue={sort}>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Preis aufsteigend</option>
              <option value="price-desc">Preis absteigend</option>
            </select>
            <button type="submit" className="btn btn--ink btn--sm">
              Anwenden
            </button>
          </form>
        </header>

        {products.length === 0 ? (
          <div className="empty-state">
            <p>Keine Artikel gefunden.</p>
            <Link href="/shop" className="btn btn--primary">
              Filter zurücksetzen
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

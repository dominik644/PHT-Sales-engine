import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFreshSessionUser } from "@/lib/b2b-auth";
import { listActiveProducts, listCategories } from "@/lib/catalog";
import { applyCompanyListPrices } from "@/lib/pricing";
import { PHT_PILLARS, PHT_SERVICE } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Hygienelösungen",
  description:
    "PHT Sortiment: Personalhygiene, Betriebshygiene, Prozesstechnik und Service.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sub?: string;
  sort?: string;
}>;

const PILLAR_ORDER = [
  ...PHT_PILLARS.map((p) => p.name),
  PHT_SERVICE.name,
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const category = sp.category?.trim() || "";
  const sub = sp.sub?.trim() || "";
  const sort =
    sp.sort === "price-asc" || sp.sort === "price-desc" ? sp.sort : "name";

  const session = await getFreshSessionUser();
  const showPrice = Boolean(session);
  const companyId =
    session?.companyStatus === "active" ? session.companyId : null;

  let [products, categories] = await Promise.all([
    listActiveProducts({ q, category, sort }),
    listCategories(),
  ]);
  if (showPrice && companyId) {
    products = await applyCompanyListPrices(products, companyId);
  }

  if (sub) {
    products = products.filter(
      (p) =>
        p.tagline.toLowerCase().includes(sub.toLowerCase()) ||
        p.name.toLowerCase().includes(sub.toLowerCase()) ||
        p.description.toLowerCase().includes(sub.toLowerCase()),
    );
  }

  categories = [...categories].sort((a, b) => {
    const ia = PILLAR_ORDER.indexOf(a.name);
    const ib = PILLAR_ORDER.indexOf(b.name);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const activePillar =
    PHT_PILLARS.find((p) => p.name === category) ??
    (category === PHT_SERVICE.name ? PHT_SERVICE : null);

  const title =
    sub || category || (q ? `Suche: ${q}` : "Hygienelösungen");

  return (
    <div className="shop-layout">
      <aside className="shop-filters" aria-label="Filter">
        <h2>Hygienelösungen</h2>
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
                className={category === cat.name && !sub ? "is-active" : undefined}
              >
                {cat.name} <span>{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        {activePillar && "subcategories" in activePillar ? (
          <div className="shop-filters__subs">
            <h3>Unterbereiche</h3>
            <ul>
              {activePillar.subcategories.map((name) => (
                <li key={name}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(category)}&sub=${encodeURIComponent(name)}`}
                    className={sub === name ? "is-active" : undefined}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      <div className="shop-main">
        <header className="shop-main__head">
          <div>
            <p className="eyebrow">
              {category ? "Bereich" : "Sortiment"}
            </p>
            <h1>{title}</h1>
            {"claim" in (activePillar ?? {}) && activePillar ? (
              <p className="muted">{activePillar.claim}</p>
            ) : null}
            <p className="muted">{products.length} Artikel</p>
          </div>
          <form className="shop-sort" method="get">
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {sub ? <input type="hidden" name="sub" value={sub} /> : null}
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
              <ProductCard
                key={product.id}
                product={product}
                showPrice={showPrice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

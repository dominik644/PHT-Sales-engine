import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { StoreHero } from "@/components/StoreHero";
import { getFreshSessionUser } from "@/lib/b2b-auth";
import { listActiveProducts } from "@/lib/catalog";
import { applyCompanyListPrices } from "@/lib/pricing";
import { PHT_PILLARS, PHT_SERVICE } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [productsRaw, session] = await Promise.all([
    listActiveProducts({ sort: "name" }),
    getFreshSessionUser(),
  ]);
  const showPrice = Boolean(session);
  const companyId =
    session?.companyStatus === "active" ? session.companyId : null;
  const products =
    showPrice && companyId
      ? await applyCompanyListPrices(productsRaw, companyId)
      : productsRaw;
  const featured = products.slice(0, 4);

  return (
    <>
      <StoreHero
        headline="Ganzheitliche Hygienelösungen für die Lebensmittelbranche."
        support="Sicher aus Erfahrung. Personalhygiene, Betriebshygiene und Prozesstechnik — mit B2B-Bestellprozess und ERP-Anbindung."
        primaryLabel="Hygienelösungen entdecken"
        primaryHref="/shop"
        secondaryHref="/register"
        secondaryLabel="Firma registrieren"
        image="/shop/hero-betriebshygiene.webp"
      />

      <section className="process-strip" aria-label="In 5 Schritten">
        <div className="process-strip__inner">
          {[
            { icon: "/shop/icon-planung.svg", label: "Planung" },
            { icon: "/shop/icon-konzept.svg", label: "Konzept" },
            { icon: "/shop/icon-montage.svg", label: "Installation" },
            { icon: "/shop/icon-wartung.svg", label: "Wartung" },
          ].map((step) => (
            <div key={step.label} className="process-strip__item">
              <Image src={step.icon} alt="" width={48} height={48} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow">Hygienelösungen</p>
            <h2>Wie bei PHT aufgeteilt — klar nach System.</h2>
          </div>
        </div>
        <div className="pillar-grid">
          {PHT_PILLARS.map((pillar) => (
            <Link key={pillar.slug} href={pillar.href} className="pillar-card">
              <div className="pillar-card__media">
                <Image
                  src={pillar.image}
                  alt={pillar.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
              </div>
              <div className="pillar-card__body">
                <p className="eyebrow">{pillar.name}</p>
                <h3>{pillar.claim}</h3>
                <p>{pillar.support}</p>
                <ul className="pillar-card__subs">
                  {pillar.subcategories.map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
                <span className="service-link">Lösungen entdecken</span>
              </div>
            </Link>
          ))}
        </div>

        <Link href={PHT_SERVICE.href} className="service-banner">
          <div>
            <p className="eyebrow">Service</p>
            <h3>{PHT_SERVICE.claim}</h3>
            <p>{PHT_SERVICE.support}</p>
          </div>
          <span className="btn btn--primary">Zum Service</span>
        </Link>
      </section>

      <section className="section section--tight">
        <div className="section__head">
          <div>
            <p className="eyebrow">Sortiment</p>
            <h2>Aktuelle Artikel</h2>
          </div>
          <Link href="/shop" className="btn btn--ink">
            Alle Artikel
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showPrice={showPrice}
            />
          ))}
        </div>
      </section>
    </>
  );
}

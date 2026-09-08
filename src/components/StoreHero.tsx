import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80";

export function StoreHero({
  brand = "PHT",
  headline,
  support,
  primaryHref = "/shop",
  primaryLabel = "Shop the collection",
  secondaryHref,
  secondaryLabel,
  compact = false,
}: {
  brand?: string;
  headline: string;
  support: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`hero ${compact ? "hero--compact" : ""}`}
      aria-label="PHT hero"
    >
      <div className="hero__media">
        <Image
          src={HERO_IMAGE}
          alt="Bright modern interior with curated furniture and lighting"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__veil" />
      </div>
      <div className="hero__content">
        <p className="hero__brand">{brand}</p>
        <h1 className="hero__headline">{headline}</h1>
        <p className="hero__support">{support}</p>
        <div className="cta-row">
          <Link href={primaryHref} className="btn btn--primary">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="btn btn--ghost">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

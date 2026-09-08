import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2000&q=80";

export function StoreHero({
  brand = "PHT",
  headline,
  support,
  primaryHref = "/shop",
  primaryLabel = "Zum Sortiment",
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
      aria-label="PHT Hygiene Hero"
    >
      <div className="hero__media">
        <Image
          src={HERO_IMAGE}
          alt="PHT Hygiene — professionelle Hygienetechnik"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__veil" />
      </div>
      <div className="hero__content">
        <p className="hero__brand">{brand}</p>
        <p className="hero__eyebrow">Hygiene</p>
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

import Image from "next/image";
import Link from "next/link";

export function StoreHero({
  headline,
  support,
  primaryHref = "/shop",
  primaryLabel = "Hygienelösungen entdecken",
  secondaryHref,
  secondaryLabel,
  image = "/shop/hero-personalhygiene.webp",
  compact = false,
}: {
  headline: string;
  support: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  image?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`hero ${compact ? "hero--compact" : ""}`}
      aria-label="PHT Group Hero"
    >
      <div className="hero__media">
        <Image
          src={image}
          alt="PHT Group — Hygienelösungen für die Lebensmittelindustrie"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__veil" />
      </div>
      <div className="hero__content">
        <p className="hero__eyebrow">Ihr Partner für Hygiene und Technologie</p>
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

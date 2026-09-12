/** PHT Group solution structure — mirrors https://pht.group navigation. */

export type PhtPillar = {
  slug: string;
  name: string;
  claim: string;
  support: string;
  href: string;
  image: string;
  subcategories: string[];
};

export const PHT_PILLARS: PhtPillar[] = [
  {
    slug: "personalhygiene",
    name: "Personalhygiene",
    claim: "Lebensmittelsicherheit beginnt beim Personal.",
    support:
      "Hygieneschleusen, Hygienetechnik und Sozialraumausstattung — Systeme, die im Alltag funktionieren.",
    href: "/shop?category=Personalhygiene",
    image: "/shop/hero-personalhygiene.webp",
    subcategories: [
      "Hygieneschleusen",
      "Hygienetechnik",
      "Sozialraumausstattung",
    ],
  },
  {
    slug: "betriebshygiene",
    name: "Betriebshygiene",
    claim: "Hygiene ist Voraussetzung.",
    support:
      "Behälterreinigung, Schaumreinigung, Farbsysteme, Bodenentwässerung und Betriebseinrichtung.",
    href: "/shop?category=Betriebshygiene",
    image: "/shop/hero-betriebshygiene.webp",
    subcategories: [
      "Behälterreinigung",
      "Niederdruck-Schaumreinigung",
      "Reinigungsbedarf nach Farbsystem",
      "Bodenentwässerung",
      "Betriebseinrichtung",
    ],
  },
  {
    slug: "prozesstechnik",
    name: "Prozesstechnik",
    claim: "Effizienz beginnt mit der richtigen Technik.",
    support:
      "Portioniersysteme, Hebe-Kipplösungen und Fördertechnik für eine bessere Produktion.",
    href: "/shop?category=Prozesstechnik",
    image: "/shop/hero-prozesstechnik.webp",
    subcategories: [
      "Portioniersysteme",
      "Hebe-Kipplösungen",
      "Fördertechnik",
    ],
  },
];

export const PHT_SERVICE = {
  slug: "service",
  name: "Service",
  claim: "Damit Ihr Betrieb läuft. Jeden Tag.",
  support:
    "Wartungsvereinbarung, Kundendienst und langfristige Funktionsfähigkeit Ihrer Anlagen.",
  href: "/shop?category=Service",
  image: "/shop/icon-wartung.svg",
  subcategories: ["Wartung", "Kundendienst"],
} as const;

export const PHT_NAV = [
  { href: "/shop", label: "Hygienelösungen" },
  ...PHT_PILLARS.map((p) => ({ href: p.href, label: p.name })),
  { href: PHT_SERVICE.href, label: PHT_SERVICE.name },
  { href: "/schnellbestellung", label: "Schnellbestellung" },
  { href: "/angebot", label: "Angebot" },
] as const;

export const PHT_BRAND = {
  blue: "#17417D",
  red: "#DD0B30",
  redBright: "#E30613",
  black: "#040404",
  gray: "#54595F",
  soft: "#7A7A7A",
  paper: "#F1F3F5",
  white: "#FFFFFF",
} as const;

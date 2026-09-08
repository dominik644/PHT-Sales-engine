export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
};

export const products: Product[] = [
  {
    id: "pht-01",
    slug: "arc-desk-lamp",
    name: "Arc Desk Lamp",
    price: 189,
    category: "Lighting",
    tagline: "Focused light, quiet presence.",
    description:
      "A balanced steel arc with a warm dimmable LED. Built for long work sessions without glare or clutter.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    accent: "#1F4B3A",
  },
  {
    id: "pht-02",
    slug: "pulse-headphones",
    name: "Pulse Headphones",
    price: 249,
    category: "Audio",
    tagline: "Studio clarity for everyday listening.",
    description:
      "Closed-back wireless cans with adaptive noise control and a 36-hour charge. Tuned for detail, not hype.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    accent: "#1A2A3A",
  },
  {
    id: "pht-03",
    slug: "nord-lounge-chair",
    name: "Nord Lounge Chair",
    price: 620,
    category: "Furniture",
    tagline: "Sit lower. Stay longer.",
    description:
      "Oak frame, wool upholstery, and a seat angle made for reading. Assembled in small batches.",
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
    accent: "#3D2F24",
  },
  {
    id: "pht-04",
    slug: "terra-ceramic-set",
    name: "Terra Ceramic Set",
    price: 96,
    category: "Kitchen",
    tagline: "Four cups, one kiln.",
    description:
      "Hand-thrown stoneware with a matte ash glaze. Microwave safe, dishwasher ready, endlessly stackable.",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    accent: "#5C4033",
  },
  {
    id: "pht-05",
    slug: "flux-thermostat",
    name: "Flux Thermostat",
    price: 179,
    category: "Home Tech",
    tagline: "Climate control without the noise.",
    description:
      "A wall unit that learns your schedule and keeps rooms steady. Quiet motors, honest materials, clear display.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    accent: "#2C3E50",
  },
  {
    id: "pht-06",
    slug: "loom-merino-throw",
    name: "Loom Merino Throw",
    price: 148,
    category: "Textiles",
    tagline: "Soft weight for cooler evenings.",
    description:
      "100% merino, loom-finished edges, and a drape that works on sofas or beds. Machine washable on gentle.",
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
    accent: "#4A5568",
  },
  {
    id: "pht-07",
    slug: "orbit-desk-clock",
    name: "Orbit Desk Clock",
    price: 84,
    category: "Objects",
    tagline: "Time, distilled.",
    description:
      "Brushed aluminum case, silent quartz movement, and a face you can read from across the room.",
    image:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1200&q=80",
    accent: "#334155",
  },
  {
    id: "pht-08",
    slug: "ridge-bottle",
    name: "Ridge Bottle",
    price: 42,
    category: "Everyday",
    tagline: "Carry cold farther.",
    description:
      "Double-wall steel, 750 ml, powder-coated shell. Keeps drinks cold for 24 hours without sweating.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
    accent: "#0F766E",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(centsOrEuro: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(centsOrEuro);
}

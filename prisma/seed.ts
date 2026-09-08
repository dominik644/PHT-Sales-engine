import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    erpId: "ERP-PHT-01",
    sku: "PHT-ARC-LAMP",
    slug: "arc-desk-lamp",
    name: "Arc Desk Lamp",
    category: "Lighting",
    tagline: "Focused light, quiet presence.",
    description:
      "A balanced steel arc with a warm dimmable LED. Built for long work sessions without glare or clutter.",
    priceCents: 18900,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    accent: "#1F4B3A",
    stock: 42,
  },
  {
    erpId: "ERP-PHT-02",
    sku: "PHT-PULSE-HP",
    slug: "pulse-headphones",
    name: "Pulse Headphones",
    category: "Audio",
    tagline: "Studio clarity for everyday listening.",
    description:
      "Closed-back wireless cans with adaptive noise control and a 36-hour charge. Tuned for detail, not hype.",
    priceCents: 24900,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    accent: "#1A2A3A",
    stock: 28,
  },
  {
    erpId: "ERP-PHT-03",
    sku: "PHT-NORD-CHAIR",
    slug: "nord-lounge-chair",
    name: "Nord Lounge Chair",
    category: "Furniture",
    tagline: "Sit lower. Stay longer.",
    description:
      "Oak frame, wool upholstery, and a seat angle made for reading. Assembled in small batches.",
    priceCents: 62000,
    imageUrl:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
    accent: "#3D2F24",
    stock: 12,
  },
  {
    erpId: "ERP-PHT-04",
    sku: "PHT-TERRA-SET",
    slug: "terra-ceramic-set",
    name: "Terra Ceramic Set",
    category: "Kitchen",
    tagline: "Four cups, one kiln.",
    description:
      "Hand-thrown stoneware with a matte ash glaze. Microwave safe, dishwasher ready, endlessly stackable.",
    priceCents: 9600,
    imageUrl:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    accent: "#5C4033",
    stock: 64,
  },
  {
    erpId: "ERP-PHT-05",
    sku: "PHT-FLUX-THERM",
    slug: "flux-thermostat",
    name: "Flux Thermostat",
    category: "Home Tech",
    tagline: "Climate control without the noise.",
    description:
      "A wall unit that learns your schedule and keeps rooms steady. Quiet motors, honest materials, clear display.",
    priceCents: 17900,
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    accent: "#2C3E50",
    stock: 35,
  },
  {
    erpId: "ERP-PHT-06",
    sku: "PHT-LOOM-THROW",
    slug: "loom-merino-throw",
    name: "Loom Merino Throw",
    category: "Textiles",
    tagline: "Soft weight for cooler evenings.",
    description:
      "100% merino, loom-finished edges, and a drape that works on sofas or beds. Machine washable on gentle.",
    priceCents: 14800,
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
    accent: "#4A5568",
    stock: 50,
  },
  {
    erpId: "ERP-PHT-07",
    sku: "PHT-ORBIT-CLOCK",
    slug: "orbit-desk-clock",
    name: "Orbit Desk Clock",
    category: "Objects",
    tagline: "Time, distilled.",
    description:
      "Brushed aluminum case, silent quartz movement, and a face you can read from across the room.",
    priceCents: 8400,
    imageUrl:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1200&q=80",
    accent: "#334155",
    stock: 73,
  },
  {
    erpId: "ERP-PHT-08",
    sku: "PHT-RIDGE-BOTTLE",
    slug: "ridge-bottle",
    name: "Ridge Bottle",
    category: "Everyday",
    tagline: "Carry cold farther.",
    description:
      "Double-wall steel, 750 ml, powder-coated shell. Keeps drinks cold for 24 hours without sweating.",
    priceCents: 4200,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
    accent: "#0F766E",
    stock: 120,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash("demo-b2b-1234", 12);

  const company = await prisma.company.upsert({
    where: { id: "seed-company-mueller" },
    update: {
      status: "active",
      name: "Müller Fertigung GmbH",
    },
    create: {
      id: "seed-company-mueller",
      name: "Müller Fertigung GmbH",
      vatId: "DE123456789",
      billingEmail: "einkauf@mueller-fertigung.example",
      addressLine1: "Industriepark 12",
      city: "Stuttgart",
      postalCode: "70173",
      country: "DE",
      status: "active",
      erpCustomerId: "ERP-CUST-MUELLER",
    },
  });

  const users = [
    {
      email: "produktion@mueller-fertigung.example",
      name: "Anna Produktionsleiter",
      role: "PRODUCTION_MANAGER",
    },
    {
      email: "einkauf@mueller-fertigung.example",
      name: "Ben Einkauf",
      role: "PURCHASING",
    },
    {
      email: "admin@mueller-fertigung.example",
      name: "Clara Admin",
      role: "COMPANY_ADMIN",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash,
        active: true,
        companyId: company.id,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        companyId: company.id,
      },
    });
  }

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 86400000);
  await prisma.discount.upsert({
    where: { code: "PHT-B2B-10" },
    update: {
      name: "B2B 10% Einführungsrabatt",
      type: "percent",
      percentOff: 10,
      validFrom: now,
      validTo: in90,
      active: true,
      companyId: null,
    },
    create: {
      code: "PHT-B2B-10",
      name: "B2B 10% Einführungsrabatt",
      type: "percent",
      percentOff: 10,
      minSubtotalCents: 0,
      validFrom: now,
      validTo: in90,
      active: true,
      companyId: null,
    },
  });

  const paymentTerms = [
    {
      code: "VORKASSE",
      name: "Vorauskasse 100%",
      description: "Vollständige Zahlung vor Auftragsbestätigung / Produktion.",
      depositPercent: 100,
      balancePercent: 0,
      balanceDueDays: 0,
      sortOrder: 0,
    },
    {
      code: "50-50",
      name: "50/50",
      description: "50% bei Auftragserteilung, 50% vor Lieferung.",
      depositPercent: 50,
      balancePercent: 50,
      balanceDueDays: 0,
      sortOrder: 1,
    },
    {
      code: "NET-30",
      name: "Netto 30 Tage",
      description: "100% zahlbar innerhalb von 30 Tagen nach Rechnung.",
      depositPercent: 0,
      balancePercent: 100,
      balanceDueDays: 30,
      sortOrder: 2,
    },
  ];

  for (const term of paymentTerms) {
    await prisma.paymentTerm.upsert({
      where: { code: term.code },
      update: { ...term, active: true },
      create: { ...term, active: true },
    });
  }

  const fiftyFifty = await prisma.paymentTerm.findUnique({
    where: { code: "50-50" },
  });
  if (fiftyFifty) {
    await prisma.company.update({
      where: { id: company.id },
      data: { defaultPaymentTermId: fiftyFifty.id },
    });
  }

  const { writeSimplePdf } = await import("../src/lib/pdf");
  const path = await import("node:path");
  const datasheetSpecs = [
    {
      sku: "PHT-ARC-LAMP",
      title: "Technisches Datenblatt Arc Desk Lamp",
      fileName: "arc-desk-lamp.pdf",
      filePath: "datasheets/arc-desk-lamp.pdf",
      lines: [
        "PHT — Technisches Datenblatt",
        "Arc Desk Lamp",
        "SKU: PHT-ARC-LAMP",
        "Spannung: 230V / LED dimmbar",
        "Material: Stahl, pulverbeschichtet",
        "Garantie: 24 Monate",
      ],
    },
    {
      sku: "PHT-PULSE-HP",
      title: "Technisches Datenblatt Pulse Headphones",
      fileName: "pulse-headphones.pdf",
      filePath: "datasheets/pulse-headphones.pdf",
      lines: [
        "PHT — Technisches Datenblatt",
        "Pulse Headphones",
        "SKU: PHT-PULSE-HP",
        "Akku: 36 Stunden",
        "ANC: adaptiv",
        "Anschluss: USB-C / Bluetooth 5.3",
      ],
    },
  ];

  for (const spec of datasheetSpecs) {
    const product = await prisma.product.findUnique({ where: { sku: spec.sku } });
    if (!product) continue;
    writeSimplePdf(path.join(process.cwd(), "public", spec.filePath), spec.lines);
    const existing = await prisma.productDatasheet.findFirst({
      where: { productId: product.id, filePath: spec.filePath },
    });
    if (existing) {
      await prisma.productDatasheet.update({
        where: { id: existing.id },
        data: {
          title: spec.title,
          fileName: spec.fileName,
          mimeType: "application/pdf",
        },
      });
    } else {
      await prisma.productDatasheet.create({
        data: {
          productId: product.id,
          title: spec.title,
          fileName: spec.fileName,
          filePath: spec.filePath,
          mimeType: "application/pdf",
          sortOrder: 0,
        },
      });
    }
  }

  console.log(`Seeded ${products.length} products`);
  console.log("Demo B2B company: Müller Fertigung GmbH (active)");
  console.log("  produktion@mueller-fertigung.example / demo-b2b-1234");
  console.log("  einkauf@mueller-fertigung.example / demo-b2b-1234");
  console.log("  admin@mueller-fertigung.example / demo-b2b-1234");
  console.log("Discount code: PHT-B2B-10 (10%, 90 days)");
  console.log("Payment terms: VORKASSE, 50-50, NET-30");
  console.log("Datasheets: public/datasheets/*.pdf");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

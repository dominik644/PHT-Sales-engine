import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  erpId: string;
  sku: string;
  manufacturerSku: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  purpose: string;
  priceCents: number;
  imageUrl: string;
  accent: string;
  stock: number;
  minOrderQty: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  weightKg?: number;
  deliveryDaysInStock: number;
  deliveryDaysOutOfStock: number;
  gallery?: string[];
  priceTiers?: Array<{ qtyFrom: number; unitCents: number }>;
};

/**
 * Demo catalog aligned to pht.group pillars:
 * Personalhygiene · Betriebshygiene · Prozesstechnik · Service
 * Images from the live PHT homepage (copied into /public/shop).
 */
const products: SeedProduct[] = [
  // —— Personalhygiene ——
  {
    erpId: "ERP-PHT-PH-01",
    sku: "PHT-SCHLEUSE-ENTRY",
    manufacturerSku: "HS-ENTRY-01",
    slug: "hygieneschleuse-entry",
    name: "Hygieneschleuse Entry",
    category: "Personalhygiene",
    tagline: "Hygieneschleusen — Zutritt mit Hygiene-Freigabe.",
    description:
      "Personalschleuse mit Hand- und Sohlendesinfektionsprüfung vor Produktionsfreigabe. Für Lebensmittelproduktion nach IFS, BRC und FSSC 22000.",
    purpose:
      "Kontrollierter Personaleintritt in hygienekritische Produktionszonen mit dokumentierter Freigabe.",
    priceCents: 649000,
    imageUrl: "/shop/einlasskontrolle.webp",
    gallery: ["/shop/einlasskontrolle.webp", "/shop/hygienetechnik.webp"],
    accent: "#17417D",
    stock: 6,
    minOrderQty: 1,
    lengthMm: 1800,
    widthMm: 1200,
    heightMm: 2200,
    weightKg: 320,
    deliveryDaysInStock: 10,
    deliveryDaysOutOfStock: 42,
  },
  {
    erpId: "ERP-PHT-PH-02",
    sku: "PHT-HYGIENETECHNIK",
    manufacturerSku: "HT-STATION-02",
    slug: "hygienetechnik-station",
    name: "Hygienetechnik-Station",
    category: "Personalhygiene",
    tagline: "Hygienetechnik — Waschen, Desinfizieren, Trocknen.",
    description:
      "Kompakte Personalhygiene-Station aus Edelstahl: berührungslose Armatur, Seifen- und Desinfektionsdosierung für hygienesensible Bereiche.",
    purpose: "Handhygiene am Eintritt und in Sozial-/Produktionsübergängen.",
    priceCents: 189000,
    imageUrl: "/shop/hygienetechnik.webp",
    gallery: ["/shop/hygienetechnik.webp", "/shop/personal-card.webp"],
    accent: "#17417D",
    stock: 18,
    minOrderQty: 1,
    lengthMm: 900,
    widthMm: 600,
    heightMm: 1400,
    weightKg: 85,
    deliveryDaysInStock: 7,
    deliveryDaysOutOfStock: 28,
  },
  {
    erpId: "ERP-PHT-PH-03",
    sku: "PHT-SOZIALRAUM",
    manufacturerSku: "SR-SET-03",
    slug: "sozialraumausstattung",
    name: "Sozialraumausstattung Set",
    category: "Personalhygiene",
    tagline: "Sozialraumausstattung — hygienisch durchdacht.",
    description:
      "Ausstattungspaket für Umkleide und Sozialräume: Spender, Handwaschplätze und Leitsystem für getrennte Schwarz-/Weißbereiche.",
    purpose: "Schwarz-/Weiß-Trennung und hygienische Sozialraumnutzung.",
    priceCents: 98000,
    imageUrl: "/shop/personal-card.webp",
    accent: "#17417D",
    stock: 22,
    minOrderQty: 1,
    lengthMm: 1200,
    widthMm: 800,
    heightMm: 2000,
    weightKg: 45,
    deliveryDaysInStock: 5,
    deliveryDaysOutOfStock: 21,
  },
  {
    erpId: "ERP-PHT-PH-04",
    sku: "PHT-HAND-1L",
    manufacturerSku: "HD-1L-04",
    slug: "haendedesinfektion-1l",
    name: "Händedesinfektion 1 l",
    category: "Personalhygiene",
    tagline: "Hygienetechnik — Nachfüllung für Spendersysteme.",
    description:
      "Viruzides Händedesinfektionsmittel für PHT-Spender. DIN-EN-geprüft, hautverträglich mit Rückfetter.",
    purpose: "Nachfüllung für Hygienestation und Hygieneschleuse.",
    priceCents: 1290,
    imageUrl: "/shop/hero-personalhygiene.webp",
    accent: "#17417D",
    stock: 800,
    minOrderQty: 12,
    lengthMm: 90,
    widthMm: 90,
    heightMm: 250,
    weightKg: 1.05,
    deliveryDaysInStock: 2,
    deliveryDaysOutOfStock: 10,
    priceTiers: [
      { qtyFrom: 12, unitCents: 1290 },
      { qtyFrom: 48, unitCents: 1190 },
      { qtyFrom: 120, unitCents: 1090 },
    ],
  },

  // —— Betriebshygiene ——
  {
    erpId: "ERP-PHT-BH-01",
    sku: "PHT-NORMWAGEN",
    manufacturerSku: "NW-ES-01",
    slug: "normwagen",
    name: "Normwagen Edelstahl",
    category: "Betriebshygiene",
    tagline: "Betriebseinrichtung — robust für den Nassbereich.",
    description:
      "Edelstahl-Normwagen für Transport und Zwischenlagerung in der Lebensmittelproduktion. Hygienisch, stapelbar, leicht zu reinigen.",
    purpose: "Transport und Zwischenlagerung in Nass- und Hygienezonen.",
    priceCents: 245000,
    imageUrl: "/shop/normwagen.webp",
    gallery: ["/shop/normwagen.webp", "/shop/hero-betriebshygiene.webp"],
    accent: "#17417D",
    stock: 14,
    minOrderQty: 1,
    lengthMm: 1100,
    widthMm: 700,
    heightMm: 950,
    weightKg: 48,
    deliveryDaysInStock: 5,
    deliveryDaysOutOfStock: 21,
  },
  {
    erpId: "ERP-PHT-BH-02",
    sku: "PHT-SCHAUM-ND",
    manufacturerSku: "ND-SCHAUM-02",
    slug: "niederdruck-schaumreinigung",
    name: "Niederdruck-Schaumreinigung",
    category: "Betriebshygiene",
    tagline: "Niederdruck-Schaumreinigung — Wasser und Energie sparen.",
    description:
      "Schaumreinigungssystem für Anlagen und Böden. Materialschonend, dosierbar, ausgelegt für den Dauerbetrieb in der Lebensmittelindustrie.",
    purpose: "Schonende Flächen- und Anlagenreinigung im Dauerbetrieb.",
    priceCents: 128000,
    imageUrl: "/shop/hero-betriebshygiene.webp",
    accent: "#17417D",
    stock: 9,
    minOrderQty: 1,
    lengthMm: 600,
    widthMm: 450,
    heightMm: 1100,
    weightKg: 62,
    deliveryDaysInStock: 7,
    deliveryDaysOutOfStock: 28,
  },
  {
    erpId: "ERP-PHT-BH-03",
    sku: "PHT-BEHAELTER",
    manufacturerSku: "BR-SYS-03",
    slug: "behaelterreinigung",
    name: "Behälterreinigungssystem",
    category: "Betriebshygiene",
    tagline: "Behälterreinigung — sauber, dokumentierbar, effizient.",
    description:
      "Anlage zur Innen- und Außenreinigung von Behältern und Transportgebinden. Reduziert manuelle Reinigungszeiten und Absicherungsrisiken.",
    purpose: "Automatisierte Behälter- und Gebindereinigung mit Dokumentation.",
    priceCents: 890000,
    imageUrl: "/shop/hero-betriebshygiene.webp",
    accent: "#17417D",
    stock: 4,
    minOrderQty: 1,
    lengthMm: 2400,
    widthMm: 1600,
    heightMm: 2200,
    weightKg: 780,
    deliveryDaysInStock: 14,
    deliveryDaysOutOfStock: 56,
  },
  {
    erpId: "ERP-PHT-BH-04",
    sku: "PHT-FARBSYSTEM",
    manufacturerSku: "FS-SET-04",
    slug: "reinigungsbedarf-farbsystem",
    name: "Reinigungsbedarf Farbsystem",
    category: "Betriebshygiene",
    tagline: "Reinigungsbedarf nach Farbsystem — Zonen klar trennen.",
    description:
      "Farbcodiertes Reinigungs-Set für Produktionszonen. Verhindert Kreuzkontamination zwischen Allergen-, Roh- und Reinbereichen.",
    purpose: "Zonentrennung und Vermeidung von Kreuzkontamination.",
    priceCents: 18900,
    imageUrl: "/shop/hygienetechnik.webp",
    accent: "#17417D",
    stock: 120,
    minOrderQty: 5,
    lengthMm: 400,
    widthMm: 300,
    heightMm: 150,
    weightKg: 3.2,
    deliveryDaysInStock: 3,
    deliveryDaysOutOfStock: 14,
    priceTiers: [
      { qtyFrom: 5, unitCents: 18900 },
      { qtyFrom: 20, unitCents: 17500 },
      { qtyFrom: 50, unitCents: 15900 },
    ],
  },

  // —— Prozesstechnik ——
  {
    erpId: "ERP-PHT-PT-01",
    sku: "PHT-PORTION",
    manufacturerSku: "PS-LINE-01",
    slug: "portioniersystem",
    name: "Portioniersystem",
    category: "Prozesstechnik",
    tagline: "Portioniersysteme — präzise, hygienisch, produktiv.",
    description:
      "Portioniereinheit für gleichmäßige Produktmengen bei hoher Taktzahl. Edelstahlausführung, leicht zu reinigen, in Linien integrierbar.",
    purpose: "Präzise Portionierung in hygienischer Produktionslinie.",
    priceCents: 1250000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    gallery: [
      "/shop/hero-prozesstechnik.webp",
      "/shop/normwagen.webp",
    ],
    accent: "#17417D",
    stock: 3,
    minOrderQty: 1,
    lengthMm: 2200,
    widthMm: 900,
    heightMm: 1800,
    weightKg: 410,
    deliveryDaysInStock: 21,
    deliveryDaysOutOfStock: 70,
  },
  {
    erpId: "ERP-PHT-PT-02",
    sku: "PHT-HEBE-KIPP",
    manufacturerSku: "HK-SOL-02",
    slug: "hebe-kipploesung",
    name: "Hebe-Kipplösung",
    category: "Prozesstechnik",
    tagline: "Hebe-Kipplösungen — ergonomisch und sicher.",
    description:
      "Hebe-Kippgerät für Behälter und Gebinde. Entlastet Personal, reduziert Unfallrisiko und hält den Produktfluss stabil.",
    purpose: "Ergonomisches Heben und Kippen von Behältern und Gebinden.",
    priceCents: 980000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    accent: "#17417D",
    stock: 5,
    minOrderQty: 1,
    lengthMm: 1600,
    widthMm: 1100,
    heightMm: 2500,
    weightKg: 520,
    deliveryDaysInStock: 14,
    deliveryDaysOutOfStock: 49,
  },
  {
    erpId: "ERP-PHT-PT-03",
    sku: "PHT-FOERDER",
    manufacturerSku: "FT-MOD-03",
    slug: "foerdertechnik",
    name: "Fördertechnik Modul",
    category: "Prozesstechnik",
    tagline: "Fördertechnik — Verbindung für Ihre Linie.",
    description:
      "Modulares Fördersystem für hygienesensible Produktion. Kurze Rüstzeiten, klare Zugänglichkeit für Reinigung und Wartung.",
    purpose: "Linienverbindung und Materialfluss in Hygienefertigung.",
    priceCents: 760000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    accent: "#17417D",
    stock: 7,
    minOrderQty: 1,
    lengthMm: 3000,
    widthMm: 600,
    heightMm: 1100,
    weightKg: 190,
    deliveryDaysInStock: 10,
    deliveryDaysOutOfStock: 35,
  },

  // —— Service ——
  {
    erpId: "ERP-PHT-SV-01",
    sku: "PHT-WARTUNG-12",
    manufacturerSku: "SV-W12-01",
    slug: "wartungsvereinbarung-12",
    name: "Wartungsvereinbarung 12 Monate",
    category: "Service",
    tagline: "Wartung — langfristige Funktionsfähigkeit.",
    description:
      "Jährliche Inspektion Ihrer PHT-Systeme, priorisierter Support und Ersatzteil-Empfehlung. Damit Ihr Betrieb jeden Tag läuft.",
    purpose: "Vorbeugende Wartung und priorisierter technischer Support.",
    priceCents: 129000,
    imageUrl: "/shop/hygienetechnik.webp",
    accent: "#DD0B30",
    stock: 999,
    minOrderQty: 1,
    deliveryDaysInStock: 1,
    deliveryDaysOutOfStock: 1,
  },
  {
    erpId: "ERP-PHT-SV-02",
    sku: "PHT-KUNDENDIENST",
    manufacturerSku: "SV-KD-02",
    slug: "kundendienst-einsatz",
    name: "Kundendienst-Einsatz",
    category: "Service",
    tagline: "Kundendienst — vor Ort, wenn es drauf ankommt.",
    description:
      "Techniker-Einsatz für Störung, Nachrüstung oder Einweisung. Koordiniert über die PHT-Servicehotline Ihrer Region.",
    purpose: "Vor-Ort-Service bei Störung, Nachrüstung oder Einweisung.",
    priceCents: 89000,
    imageUrl: "/shop/einlasskontrolle.webp",
    accent: "#DD0B30",
    stock: 999,
    minOrderQty: 1,
    deliveryDaysInStock: 2,
    deliveryDaysOutOfStock: 5,
  },
];

async function main() {
  await prisma.quoteRequestItem.deleteMany({});
  await prisma.quoteRequest.deleteMany({});
  await prisma.serviceRequest.deleteMany({});
  await prisma.customerDocument.deleteMany({});
  await prisma.customerAsset.deleteMany({});
  await prisma.productSparePart.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.priceTier.deleteMany({});
  await prisma.productDatasheet.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderEvent.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderApproval.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.shippingMethod.deleteMany({});
  await prisma.paymentTerm.deleteMany({});
  await prisma.priceGroup.deleteMany({});

  const priceStandard = await prisma.priceGroup.create({
    data: {
      code: "STANDARD",
      name: "Standard Listenpreis",
      percentOff: 0,
    },
  });
  const pricePartner = await prisma.priceGroup.create({
    data: {
      code: "PARTNER",
      name: "Partnerkondition",
      percentOff: 10,
    },
  });
  void priceStandard;

  const termVorkasse = await prisma.paymentTerm.create({
    data: {
      code: "VORKASSE",
      name: "Vorauskasse",
      description: "100 % Zahlung vor Auslieferung",
      depositPercent: 100,
      balancePercent: 0,
      balanceDueDays: 0,
      active: true,
      sortOrder: 1,
    },
  });

  await prisma.paymentTerm.create({
    data: {
      code: "50-50",
      name: "50/50",
      description: "50 % bei Auftrag, 50 % vor Lieferung",
      depositPercent: 50,
      balancePercent: 50,
      balanceDueDays: 0,
      active: true,
      sortOrder: 2,
    },
  });

  const termNet30 = await prisma.paymentTerm.create({
    data: {
      code: "NET-30",
      name: "Netto 30",
      description: "Zahlung innerhalb von 30 Tagen",
      depositPercent: 0,
      balancePercent: 100,
      balanceDueDays: 30,
      active: true,
      sortOrder: 3,
    },
  });
  void termVorkasse;

  await prisma.shippingMethod.create({
    data: {
      code: "STANDARD",
      name: "Standardversand",
      description: "Spedition / Paket, 3–5 Werktage",
      baseCents: 1990,
      freeAboveCents: 250000,
      allowsPickup: false,
      active: true,
      sortOrder: 1,
    },
  });
  await prisma.shippingMethod.create({
    data: {
      code: "EXPRESS",
      name: "Express",
      description: "Schnelllieferung, 1–2 Werktage",
      baseCents: 4900,
      freeAboveCents: null,
      allowsPickup: false,
      active: true,
      sortOrder: 2,
    },
  });
  await prisma.shippingMethod.create({
    data: {
      code: "PICKUP",
      name: "Abholung",
      description: "Abholung am Standort Bad Tölz / Beckum",
      baseCents: 0,
      freeAboveCents: null,
      allowsPickup: true,
      active: true,
      sortOrder: 3,
    },
  });

  for (const product of products) {
    const { gallery, priceTiers, ...base } = product;
    const created = await prisma.product.create({
      data: {
        ...base,
        active: true,
        images: gallery?.length
          ? {
              create: gallery.map((url, index) => ({
                url,
                alt: product.name,
                sortOrder: index,
              })),
            }
          : {
              create: [
                {
                  url: product.imageUrl,
                  alt: product.name,
                  sortOrder: 0,
                },
              ],
            },
        priceTiers: priceTiers?.length
          ? { create: priceTiers }
          : undefined,
      },
    });
    void created;
  }

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash("demo-b2b-1234", 12);

  const company = await prisma.company.create({
    data: {
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
      priceGroupId: pricePartner.id,
      defaultPaymentTermId: termNet30.id,
      requiresPrepaid: false,
      approvalThresholdCents: 500000,
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
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        companyId: company.id,
        active: true,
      },
    });
  }

  const from = new Date();
  const to = new Date(Date.now() + 90 * 86400000);
  await prisma.discount.create({
    data: {
      code: "PHT-B2B-10",
      name: "PHT Partner 10 %",
      type: "percent",
      percentOff: 10,
      amountOffCents: null,
      minSubtotalCents: 0,
      validFrom: from,
      validTo: to,
      active: true,
      companyId: company.id,
    },
  });

  // Datenblätter für alle Geräte (+ SDB für Verbrauchschemikalien)
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  await mkdir(path.join(process.cwd(), "public", "datasheets"), {
    recursive: true,
  });
  await mkdir(path.join(process.cwd(), "public", "customer-docs"), {
    recursive: true,
  });

  async function writeSheet(
    productId: string,
    sku: string,
    title: string,
    lines: string[],
  ) {
    const fileName = `${sku.toLowerCase()}-datenblatt.pdf`;
    const filePath = `datasheets/${fileName}`;
    const bodyLines = lines
      .map((line, i) => (i === 0 ? `(${line}) Tj` : `0 -18 Td (${line}) Tj`))
      .join("\n");
    const stream = ["BT /F1 12 Tf 50 740 Td", bodyLines, "ET"].join("\n");
    const content = [
      "%PDF-1.4",
      "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
      "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
      "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
      `4 0 obj<< /Length ${stream.length} >>stream`,
      stream,
      "endstream endobj",
      "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
      "xref",
      "0 6",
      "0000000000 65535 f ",
      "0000000009 00000 n ",
      "0000000058 00000 n ",
      "0000000115 00000 n ",
      "0000000266 00000 n ",
      "0000000560 00000 n ",
      "trailer<< /Size 6 /Root 1 0 R >>",
      "startxref",
      "640",
      "%%EOF",
    ].join("\n");
    await writeFile(path.join(process.cwd(), "public", filePath), content);
    await prisma.productDatasheet.create({
      data: {
        productId,
        title,
        fileName,
        filePath,
        mimeType: "application/pdf",
      },
    });
  }

  const allProducts = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, sku: true, name: true, category: true },
  });

  const bySku = new Map(allProducts.map((p) => [p.sku, p]));

  const chemicalSkus = new Set(["PHT-HAND-1L", "PHT-FARBSYSTEM"]);
  const serviceSkus = new Set(["PHT-WARTUNG-12", "PHT-KUNDENDIENST"]);

  for (const product of allProducts) {
    if (serviceSkus.has(product.sku)) continue;

    const isChemical = chemicalSkus.has(product.sku);
    const title = isChemical
      ? "Sicherheitsdatenblatt (SDB)"
      : "Technisches Datenblatt";

    await writeSheet(product.id, product.sku, title, [
      "PHT Group - Dokument",
      title,
      `SKU: ${product.sku}`,
      product.name.replace(/[()]/g, " "),
      `Bereich: ${product.category}`,
      "Demo-PDF - Originaldatenblatt folgt im Live-Betrieb",
    ]);
  }

  // Ersatzteile: Hygieneschleuse Entry → Händedesinfektion + Hygienetechnik
  const schleuse = bySku.get("PHT-SCHLEUSE-ENTRY");
  const hand = bySku.get("PHT-HAND-1L");
  const hygienetechnik = bySku.get("PHT-HYGIENETECHNIK");
  if (schleuse && hand) {
    await prisma.productSparePart.create({
      data: {
        machineProductId: schleuse.id,
        spareProductId: hand.id,
        qtyPerUnit: 4,
        note: "Desinfektionsnachfüllung für Spendersystem",
      },
    });
  }
  if (schleuse && hygienetechnik) {
    await prisma.productSparePart.create({
      data: {
        machineProductId: schleuse.id,
        spareProductId: hygienetechnik.id,
        qtyPerUnit: 1,
        note: "Ergänzende Hygienestation am Eintritt",
      },
    });
  }

  if (schleuse) {
    await prisma.customerAsset.create({
      data: {
        companyId: company.id,
        productId: schleuse.id,
        serial: "HS-ENTRY-MUELLER-001",
        name: "Hygieneschleuse Entry — Linie A",
        installedAt: new Date("2024-06-15"),
      },
    });
  }

  const docFileName = "mueller-rahmenvertrag-demo.pdf";
  const docRel = `customer-docs/${docFileName}`;
  const docStream = [
    "BT /F1 12 Tf 50 740 Td",
    "(PHT Group - Kundendokument) Tj",
    "0 -18 Td (Rahmenvertrag Demo) Tj",
    "0 -18 Td (Mueller Fertigung GmbH) Tj",
    "0 -18 Td (Platzhalter-PDF - bitte rechtlich pruefen lassen) Tj",
    "ET",
  ].join("\n");
  const docPdf = [
    "%PDF-1.4",
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${docStream.length} >>stream`,
    docStream,
    "endstream endobj",
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000009 00000 n ",
    "0000000058 00000 n ",
    "0000000115 00000 n ",
    "0000000266 00000 n ",
    "0000000560 00000 n ",
    "trailer<< /Size 6 /Root 1 0 R >>",
    "startxref",
    "640",
    "%%EOF",
  ].join("\n");
  await writeFile(path.join(process.cwd(), "public", docRel), docPdf);

  await prisma.customerDocument.create({
    data: {
      companyId: company.id,
      type: "other",
      title: "Rahmenvertrag / Konditionen (Demo)",
      filePath: docRel,
      erpDocId: "ERP-DOC-MUELLER-001",
    },
  });

  console.log(
    "Seeded PHT Group catalog (Personal-/Betriebs-/Prozesstechnik + Service)",
  );
  console.log(
    `Datasheets: ${allProducts.length - serviceSkus.size} Geräte/Dokumente`,
  );
  console.log("PriceGroups: STANDARD (0%), PARTNER (10%)");
  console.log("Shipping: STANDARD / EXPRESS / PICKUP");
  console.log("Company: Müller Fertigung · PARTNER · requiresPrepaid=false");
  
  const pendingCompany = await prisma.company.create({
    data: {
      id: "seed-company-pending",
      name: "Nordfrisch Demo GmbH (wartet auf Freigabe)",
      vatId: "DE998877665",
      billingEmail: "neu@nordfrisch-demo.example",
      addressLine1: "Hafenstraße 1",
      city: "Hamburg",
      postalCode: "20457",
      country: "DE",
      status: "pending",
      requiresPrepaid: true,
      priceGroupId: (await prisma.priceGroup.findFirst({ where: { code: "STANDARD" } }))?.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "admin@nordfrisch-demo.example",
      name: "Nora Pending",
      role: "COMPANY_ADMIN",
      passwordHash: await hash("demo-b2b-1234", 12),
      companyId: pendingCompany.id,
      active: true,
    },
  });
  console.log("Pending company:", pendingCompany.name);

console.log("Discount code: PHT-B2B-10 (10%, 90 days)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

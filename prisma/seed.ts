import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Demo catalog aligned to pht.group pillars:
 * Personalhygiene · Betriebshygiene · Prozesstechnik · Service
 * Images from the live PHT homepage (copied into /public/shop).
 */
const products = [
  // —— Personalhygiene ——
  {
    erpId: "ERP-PHT-PH-01",
    sku: "PHT-SCHLEUSE-ENTRY",
    slug: "hygieneschleuse-entry",
    name: "Hygieneschleuse Entry",
    category: "Personalhygiene",
    tagline: "Hygieneschleusen — Zutritt mit Hygiene-Freigabe.",
    description:
      "Personalschleuse mit Hand- und Sohlendesinfektionsprüfung vor Produktionsfreigabe. Für Lebensmittelproduktion nach IFS, BRC und FSSC 22000.",
    priceCents: 649000,
    imageUrl: "/shop/einlasskontrolle.webp",
    accent: "#17417D",
    stock: 6,
  },
  {
    erpId: "ERP-PHT-PH-02",
    sku: "PHT-HYGIENETECHNIK",
    slug: "hygienetechnik-station",
    name: "Hygienetechnik-Station",
    category: "Personalhygiene",
    tagline: "Hygienetechnik — Waschen, Desinfizieren, Trocknen.",
    description:
      "Kompakte Personalhygiene-Station aus Edelstahl: berührungslose Armatur, Seifen- und Desinfektionsdosierung für hygienesensible Bereiche.",
    priceCents: 189000,
    imageUrl: "/shop/hygienetechnik.webp",
    accent: "#17417D",
    stock: 18,
  },
  {
    erpId: "ERP-PHT-PH-03",
    sku: "PHT-SOZIALRAUM",
    slug: "sozialraumausstattung",
    name: "Sozialraumausstattung Set",
    category: "Personalhygiene",
    tagline: "Sozialraumausstattung — hygienisch durchdacht.",
    description:
      "Ausstattungspaket für Umkleide und Sozialräume: Spender, Handwaschplätze und Leitsystem für getrennte Schwarz-/Weißbereiche.",
    priceCents: 98000,
    imageUrl: "/shop/personal-card.webp",
    accent: "#17417D",
    stock: 22,
  },
  {
    erpId: "ERP-PHT-PH-04",
    sku: "PHT-HAND-1L",
    slug: "haendedesinfektion-1l",
    name: "Händedesinfektion 1 l",
    category: "Personalhygiene",
    tagline: "Hygienetechnik — Nachfüllung für Spendersysteme.",
    description:
      "Viruzides Händedesinfektionsmittel für PHT-Spender. DIN-EN-geprüft, hautverträglich mit Rückfetter.",
    priceCents: 1290,
    imageUrl: "/shop/hero-personalhygiene.webp",
    accent: "#17417D",
    stock: 800,
  },

  // —— Betriebshygiene ——
  {
    erpId: "ERP-PHT-BH-01",
    sku: "PHT-NORMWAGEN",
    slug: "normwagen",
    name: "Normwagen Edelstahl",
    category: "Betriebshygiene",
    tagline: "Betriebseinrichtung — robust für den Nassbereich.",
    description:
      "Edelstahl-Normwagen für Transport und Zwischenlagerung in der Lebensmittelproduktion. Hygienisch, stapelbar, leicht zu reinigen.",
    priceCents: 245000,
    imageUrl: "/shop/normwagen.webp",
    accent: "#17417D",
    stock: 14,
  },
  {
    erpId: "ERP-PHT-BH-02",
    sku: "PHT-SCHAUM-ND",
    slug: "niederdruck-schaumreinigung",
    name: "Niederdruck-Schaumreinigung",
    category: "Betriebshygiene",
    tagline: "Niederdruck-Schaumreinigung — Wasser und Energie sparen.",
    description:
      "Schaumreinigungssystem für Anlagen und Böden. Materialschonend, dosierbar, ausgelegt für den Dauerbetrieb in der Lebensmittelindustrie.",
    priceCents: 128000,
    imageUrl: "/shop/hero-betriebshygiene.webp",
    accent: "#17417D",
    stock: 9,
  },
  {
    erpId: "ERP-PHT-BH-03",
    sku: "PHT-BEHAELTER",
    slug: "behaelterreinigung",
    name: "Behälterreinigungssystem",
    category: "Betriebshygiene",
    tagline: "Behälterreinigung — sauber, dokumentierbar, effizient.",
    description:
      "Anlage zur Innen- und Außenreinigung von Behältern und Transportgebinden. Reduziert manuelle Reinigungszeiten und Absicherungsrisiken.",
    priceCents: 890000,
    imageUrl: "/shop/hero-betriebshygiene.webp",
    accent: "#17417D",
    stock: 4,
  },
  {
    erpId: "ERP-PHT-BH-04",
    sku: "PHT-FARBSYSTEM",
    slug: "reinigungsbedarf-farbsystem",
    name: "Reinigungsbedarf Farbsystem",
    category: "Betriebshygiene",
    tagline: "Reinigungsbedarf nach Farbsystem — Zonen klar trennen.",
    description:
      "Farbcodiertes Reinigungs-Set für Produktionszonen. Verhindert Kreuzkontamination zwischen Allergen-, Roh- und Reinbereichen.",
    priceCents: 18900,
    imageUrl: "/shop/hygienetechnik.webp",
    accent: "#17417D",
    stock: 120,
  },

  // —— Prozesstechnik ——
  {
    erpId: "ERP-PHT-PT-01",
    sku: "PHT-PORTION",
    slug: "portioniersystem",
    name: "Portioniersystem",
    category: "Prozesstechnik",
    tagline: "Portioniersysteme — präzise, hygienisch, produktiv.",
    description:
      "Portioniereinheit für gleichmäßige Produktmengen bei hoher Taktzahl. Edelstahlausführung, leicht zu reinigen, in Linien integrierbar.",
    priceCents: 1250000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    accent: "#17417D",
    stock: 3,
  },
  {
    erpId: "ERP-PHT-PT-02",
    sku: "PHT-HEBE-KIPP",
    slug: "hebe-kipploesung",
    name: "Hebe-Kipplösung",
    category: "Prozesstechnik",
    tagline: "Hebe-Kipplösungen — ergonomisch und sicher.",
    description:
      "Hebe-Kippgerät für Behälter und Gebinde. Entlastet Personal, reduziert Unfallrisiko und hält den Produktfluss stabil.",
    priceCents: 980000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    accent: "#17417D",
    stock: 5,
  },
  {
    erpId: "ERP-PHT-PT-03",
    sku: "PHT-FOERDER",
    slug: "foerdertechnik",
    name: "Fördertechnik Modul",
    category: "Prozesstechnik",
    tagline: "Fördertechnik — Verbindung für Ihre Linie.",
    description:
      "Modulares Fördersystem für hygienesensible Produktion. Kurze Rüstzeiten, klare Zugänglichkeit für Reinigung und Wartung.",
    priceCents: 760000,
    imageUrl: "/shop/hero-prozesstechnik.webp",
    accent: "#17417D",
    stock: 7,
  },

  // —— Service ——
  {
    erpId: "ERP-PHT-SV-01",
    sku: "PHT-WARTUNG-12",
    slug: "wartungsvereinbarung-12",
    name: "Wartungsvereinbarung 12 Monate",
    category: "Service",
    tagline: "Wartung — langfristige Funktionsfähigkeit.",
    description:
      "Jährliche Inspektion Ihrer PHT-Systeme, priorisierter Support und Ersatzteil-Empfehlung. Damit Ihr Betrieb jeden Tag läuft.",
    priceCents: 129000,
    imageUrl: "/shop/hygienetechnik.webp",
    accent: "#DD0B30",
    stock: 999,
  },
  {
    erpId: "ERP-PHT-SV-02",
    sku: "PHT-KUNDENDIENST",
    slug: "kundendienst-einsatz",
    name: "Kundendienst-Einsatz",
    category: "Service",
    tagline: "Kundendienst — vor Ort, wenn es drauf ankommt.",
    description:
      "Techniker-Einsatz für Störung, Nachrüstung oder Einweisung. Koordiniert über die PHT-Servicehotline Ihrer Region.",
    priceCents: 89000,
    imageUrl: "/shop/einlasskontrolle.webp",
    accent: "#DD0B30",
    stock: 999,
  },
];

async function main() {
  await prisma.productDatasheet.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderEvent.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderApproval.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

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

  const termVorkasse = await prisma.paymentTerm.upsert({
    where: { code: "VORKASSE" },
    update: {
      name: "Vorauskasse",
      description: "100 % Zahlung vor Auslieferung",
      depositPercent: 100,
      balancePercent: 0,
      balanceDueDays: 0,
      active: true,
      sortOrder: 1,
    },
    create: {
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

  await prisma.paymentTerm.upsert({
    where: { code: "50-50" },
    update: {
      name: "50/50",
      description: "50 % bei Auftrag, 50 % vor Lieferung",
      depositPercent: 50,
      balancePercent: 50,
      balanceDueDays: 0,
      active: true,
      sortOrder: 2,
    },
    create: {
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

  await prisma.paymentTerm.upsert({
    where: { code: "NET-30" },
    update: {
      name: "Netto 30",
      description: "Zahlung innerhalb von 30 Tagen",
      depositPercent: 0,
      balancePercent: 100,
      balanceDueDays: 30,
      active: true,
      sortOrder: 3,
    },
    create: {
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

  await prisma.company.update({
    where: { id: company.id },
    data: { defaultPaymentTermId: termVorkasse.id },
  });

  const from = new Date();
  const to = new Date(Date.now() + 90 * 86400000);
  await prisma.discount.upsert({
    where: { code: "PHT-B2B-10" },
    update: {
      name: "PHT Partner 10 %",
      type: "percent",
      percentOff: 10,
      amountOffCents: null,
      minSubtotalCents: 0,
      validFrom: from,
      validTo: to,
      active: true,
    },
    create: {
      code: "PHT-B2B-10",
      name: "PHT Partner 10 %",
      type: "percent",
      percentOff: 10,
      amountOffCents: null,
      minSubtotalCents: 0,
      validFrom: from,
      validTo: to,
      active: true,
    },
  });

  // Datenblätter für alle Geräte (+ SDB für Verbrauchschemikalien)
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  await mkdir(path.join(process.cwd(), "public", "datasheets"), {
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

  console.log(
    "Seeded PHT Group catalog (Personal-/Betriebs-/Prozesstechnik + Service)",
  );
  console.log(
    `Datasheets: ${allProducts.length - serviceSkus.size} Geräte/Dokumente`,
  );
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

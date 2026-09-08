import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** PHT Hygiene — B2B Fachsortiment (Hygienetechnik & Verbrauchsmaterial) */
const products = [
  {
    erpId: "ERP-PHT-01",
    sku: "PHT-WASHX-PRO",
    slug: "handwaschbecken-washx-pro",
    name: "Handwaschbecken WashX Pro",
    category: "Personalhygiene",
    tagline: "Sensor-Handwaschbecken für hygienesensible Bereiche.",
    description:
      "Edelstahl-Handwaschbecken mit berührungsloser Armatur, Seifen- und Desinfektionsdosierung. Für Lebensmittelproduktion, Pharma und Gemeinschaftsverpflegung.",
    priceCents: 189000,
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
    accent: "#1B2A34",
    stock: 24,
  },
  {
    erpId: "ERP-PHT-02",
    sku: "PHT-ENTRYX",
    slug: "zutrittskontrolle-entryx",
    name: "Zutrittskontrolle EntryX",
    category: "Zutritt",
    tagline: "Personalschleuse mit Hygiene-Freigabe.",
    description:
      "Zutrittssystem mit Hand- und Sohlendesinfektionsprüfung vor Produktionsfreigabe. Protokollierbar, anbindbar an bestehende Zugangssysteme.",
    priceCents: 649000,
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80",
    accent: "#24353F",
    stock: 8,
  },
  {
    erpId: "ERP-PHT-03",
    sku: "PHT-HELIX",
    slug: "sohlenreinigung-helix",
    name: "Sohlenreinigung HeliX",
    category: "Sohlenhygiene",
    tagline: "Automatische Sohlenwaschung am Eingang.",
    description:
      "Kompakte Sohlenreinigungsanlage für hohe Frequenz. Edelstahlgehäuse, Bürstenwechsel ohne Werkzeug, geeignet für Nassbereiche.",
    priceCents: 428000,
    imageUrl:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80",
    accent: "#2C3E48",
    stock: 12,
  },
  {
    erpId: "ERP-PHT-04",
    sku: "PHT-DES-5L",
    slug: "flaechendesinfektion-5l",
    name: "Flächendesinfektion 5 l",
    category: "Desinfektion",
    tagline: "Gebrauchsfertig für Produktionsflächen.",
    description:
      "Alkoholbasierte Flächendesinfektion für Edelstahl und glatte Oberflächen. Gebinde 5 Liter, mit Sicherheitsdatenblatt und Anwendungshinweis.",
    priceCents: 4890,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=80",
    accent: "#33424A",
    stock: 320,
  },
  {
    erpId: "ERP-PHT-05",
    sku: "PHT-HAND-1L",
    slug: "haendedesinfektion-1l",
    name: "Händedesinfektion 1 l",
    category: "Desinfektion",
    tagline: "Für Spendersysteme und Nachfüllung.",
    description:
      "Viruzides Händedesinfektionsmittel für Nachfüllung in PHT-Spendern. DIN-EN-geprüft, hautverträglich mit Rückfetter.",
    priceCents: 1290,
    imageUrl:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1400&q=80",
    accent: "#1F3038",
    stock: 800,
  },
  {
    erpId: "ERP-PHT-06",
    sku: "PHT-PAPER-TOWEL",
    slug: "papierhandtuecher-z-falz",
    name: "Papierhandtücher Z-Falz",
    category: "Verbrauchsmaterial",
    tagline: "Karton à 3.200 Blatt für Spender.",
    description:
      "2-lagige Papierhandtücher, Z-Falz, hohe Saugkraft. Passend für gängige Spendersysteme in Hygienezonen und Sozialräumen.",
    priceCents: 3490,
    imageUrl:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1400&q=80",
    accent: "#2A3840",
    stock: 450,
  },
  {
    erpId: "ERP-PHT-07",
    sku: "PHT-FOAM-CLEAN",
    slug: "schaumreiniger-green",
    name: "Schaumreiniger Green",
    category: "Reinigung",
    tagline: "Wasser- und energiesparende Schaumreinigung.",
    description:
      "Schaumreiniger für Anlagen und Böden in der Lebensmittelindustrie. Dosierbar, materialschonend, mit optionalem GREEN-Button-Modul kompatibel.",
    priceCents: 7890,
    imageUrl:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1400&q=80",
    accent: "#3A464C",
    stock: 160,
  },
  {
    erpId: "ERP-PHT-08",
    sku: "PHT-SERVICE-HYG",
    slug: "hygiene-wartungsvertrag",
    name: "Hygiene-Wartungsvertrag",
    category: "Service",
    tagline: "Inspektion und Ersatzteil-Support 12 Monate.",
    description:
      "Jährliche Prüfung von WashX/EntryX/HeliX, Verbrauchsmaterial-Empfehlung und priorisierter Support für Partnerbetriebe.",
    priceCents: 129000,
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80",
    accent: "#243038",
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
      name: "PHT Hygiene Partner 10 %",
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
      name: "PHT Hygiene Partner 10 %",
      type: "percent",
      percentOff: 10,
      amountOffCents: null,
      minSubtotalCents: 0,
      validFrom: from,
      validTo: to,
      active: true,
    },
  });

  const wash = await prisma.product.findUnique({ where: { sku: "PHT-WASHX-PRO" } });
  const des = await prisma.product.findUnique({ where: { sku: "PHT-DES-5L" } });

  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  await mkdir(path.join(process.cwd(), "public", "datasheets"), { recursive: true });

  async function writeSheet(
    productId: string,
    sku: string,
    title: string,
    lines: string[],
  ) {
    const fileName = `${sku.toLowerCase()}-datenblatt.pdf`;
    const filePath = `datasheets/${fileName}`;
    const content = [
      "%PDF-1.1",
      "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
      "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
      "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
      `4 0 obj<< /Length ${200 + lines.join(" ").length} >>stream`,
      "BT /F1 12 Tf 50 740 Td",
      ...lines.map((line, i) =>
        i === 0 ? `(${line}) Tj` : `0 -18 Td (${line}) Tj`,
      ),
      "ET",
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
      data: { productId, title, fileName, filePath },
    });
  }

  if (wash) {
    await writeSheet(wash.id, wash.sku, "Technisches Datenblatt", [
      "PHT Hygiene - Technisches Datenblatt",
      `SKU: ${wash.sku}`,
      "Handwaschbecken WashX Pro",
      "Edelstahl | Sensorarmatur | Dosierung",
    ]);
  }
  if (des) {
    await writeSheet(des.id, des.sku, "Sicherheitsdatenblatt", [
      "PHT Hygiene - Sicherheitsdatenblatt",
      `SKU: ${des.sku}`,
      "Flaechendesinfektion 5 l",
      "Alkoholbasiert | Gebrauchsfertig",
    ]);
  }

  console.log("Seeded PHT Hygiene catalog + B2B demo company");
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

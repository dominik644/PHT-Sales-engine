import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export type StoreDatasheet = {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  mimeType: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  sku: string;
  manufacturerSku: string | null;
  name: string;
  price: number;
  priceCents: number;
  category: string;
  tagline: string;
  description: string;
  purpose: string;
  image: string;
  images: string[];
  accent: string;
  stock: number;
  minOrderQty: number;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  deliveryDaysInStock: number;
  deliveryDaysOutOfStock: number;
  vatRateBps: number;
  datasheets: StoreDatasheet[];
  priceTiers: Array<{ qtyFrom: number; unitCents: number }>;
  spareParts: Array<{
    id: string;
    qtyPerUnit: number;
    note: string;
    product: {
      id: string;
      slug: string;
      sku: string;
      name: string;
      priceCents: number;
      image: string;
      stock: number;
    };
  }>;
};

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  manufacturerSku: string | null;
  name: string;
  priceCents: number;
  category: string;
  tagline: string;
  description: string;
  purpose: string;
  imageUrl: string;
  accent: string;
  stock: number;
  minOrderQty: number;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  deliveryDaysInStock: number;
  deliveryDaysOutOfStock: number;
  vatRateBps: number;
  datasheets?: StoreDatasheet[];
  images?: Array<{ url: string; sortOrder: number }>;
  priceTiers?: Array<{ qtyFrom: number; unitCents: number }>;
  spareFor?: Array<{
    id: string;
    qtyPerUnit: number;
    note: string;
    spareProduct: {
      id: string;
      slug: string;
      sku: string;
      name: string;
      priceCents: number;
      imageUrl: string;
      stock: number;
    };
  }>;
};

export function toStoreProduct(p: ProductRow): StoreProduct {
  const gallery = (p.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.url);
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    manufacturerSku: p.manufacturerSku,
    name: p.name,
    price: p.priceCents / 100,
    priceCents: p.priceCents,
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    purpose: p.purpose,
    image: p.imageUrl,
    images: gallery.length ? gallery : [p.imageUrl],
    accent: p.accent,
    stock: p.stock,
    minOrderQty: p.minOrderQty,
    lengthMm: p.lengthMm,
    widthMm: p.widthMm,
    heightMm: p.heightMm,
    weightKg: p.weightKg,
    deliveryDaysInStock: p.deliveryDaysInStock,
    deliveryDaysOutOfStock: p.deliveryDaysOutOfStock,
    vatRateBps: p.vatRateBps,
    datasheets: p.datasheets ?? [],
    priceTiers: (p.priceTiers ?? []).slice().sort((a, b) => a.qtyFrom - b.qtyFrom),
    spareParts: (p.spareFor ?? []).map((s) => ({
      id: s.id,
      qtyPerUnit: s.qtyPerUnit,
      note: s.note,
      product: {
        id: s.spareProduct.id,
        slug: s.spareProduct.slug,
        sku: s.spareProduct.sku,
        name: s.spareProduct.name,
        priceCents: s.spareProduct.priceCents,
        image: s.spareProduct.imageUrl,
        stock: s.spareProduct.stock,
      },
    })),
  };
}

const productInclude = {
  datasheets: { orderBy: { sortOrder: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
  priceTiers: { orderBy: { qtyFrom: "asc" as const } },
  spareFor: {
    include: {
      spareProduct: true,
    },
  },
};

export type ProductQuery = {
  q?: string;
  category?: string;
  sort?: "name" | "price-asc" | "price-desc";
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9äöüß]/gi, "");
}

/** Leichte Tippfehler-Toleranz (enthält / Präfix / 1-Zeichen-Diff für kurze Tokens). */
function fuzzyMatch(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return true;
  if (h.includes(n)) return true;
  if (n.length >= 4 && h.includes(n.slice(0, -1))) return true;
  return false;
}

export async function listActiveProducts(
  query: ProductQuery = {},
): Promise<StoreProduct[]> {
  const where: { active: true; category?: string } = { active: true };
  if (query.category) where.category = query.category;

  const orderBy =
    query.sort === "price-asc"
      ? { priceCents: "asc" as const }
      : query.sort === "price-desc"
        ? { priceCents: "desc" as const }
        : { name: "asc" as const };

  let rows = await prisma.product.findMany({
    where,
    orderBy,
    include: productInclude,
  });

  if (query.q?.trim()) {
    const q = query.q.trim();
    rows = rows.filter(
      (p) =>
        fuzzyMatch(p.name, q) ||
        fuzzyMatch(p.sku, q) ||
        fuzzyMatch(p.manufacturerSku ?? "", q) ||
        fuzzyMatch(p.tagline, q) ||
        fuzzyMatch(p.description, q) ||
        fuzzyMatch(p.purpose, q),
    );
  }

  return rows.map(toStoreProduct);
}

export async function listCategories(): Promise<
  Array<{ name: string; count: number }>
> {
  const grouped = await prisma.product.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
  return grouped.map((g) => ({ name: g.category, count: g._count._all }));
}

export async function getProductBySlug(
  slug: string,
): Promise<StoreProduct | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!row || !row.active) return null;
  return toStoreProduct(row);
}

export async function getProductBySku(sku: string): Promise<StoreProduct | null> {
  const row = await prisma.product.findFirst({
    where: { sku: { equals: sku }, active: true },
    include: productInclude,
  });
  if (!row) return null;
  return toStoreProduct(row);
}

export { formatMoney };

export function formatPrice(euros: number): string {
  return formatMoney(Math.round(euros * 100));
}

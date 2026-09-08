import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export type StoreProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  priceCents: number;
  category: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  stock: number;
  datasheets: Array<{
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    mimeType: string;
  }>;
};

export function toStoreProduct(p: {
  id: string;
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  category: string;
  tagline: string;
  description: string;
  imageUrl: string;
  accent: string;
  stock: number;
  datasheets?: Array<{
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    mimeType: string;
  }>;
}): StoreProduct {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    price: p.priceCents / 100,
    priceCents: p.priceCents,
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    image: p.imageUrl,
    accent: p.accent,
    stock: p.stock,
    datasheets: p.datasheets ?? [],
  };
}

export type ProductQuery = {
  q?: string;
  category?: string;
  sort?: "name" | "price-asc" | "price-desc";
};

export async function listActiveProducts(
  query: ProductQuery = {},
): Promise<StoreProduct[]> {
  const where: {
    active: true;
    category?: string;
    OR?: Array<
      | { name: { contains: string } }
      | { sku: { contains: string } }
      | { tagline: { contains: string } }
      | { description: { contains: string } }
    >;
  } = { active: true };

  if (query.category) where.category = query.category;
  if (query.q?.trim()) {
    const q = query.q.trim();
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { tagline: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy =
    query.sort === "price-asc"
      ? { priceCents: "asc" as const }
      : query.sort === "price-desc"
        ? { priceCents: "desc" as const }
        : { name: "asc" as const };

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    include: { datasheets: { orderBy: { sortOrder: "asc" } } },
  });
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
    include: { datasheets: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row || !row.active) return null;
  return toStoreProduct(row);
}

export { formatMoney };

export function formatPrice(euros: number): string {
  return formatMoney(Math.round(euros * 100));
}

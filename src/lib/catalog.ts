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

export async function listActiveProducts(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { datasheets: { orderBy: { sortOrder: "asc" } } },
  });
  return rows.map(toStoreProduct);
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

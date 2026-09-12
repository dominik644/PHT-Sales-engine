import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStoreProduct } from "@/lib/catalog";
import { getFreshSessionUser } from "@/lib/b2b-auth";
import { applyCompanyListPrices, resolveUnitPrice } from "@/lib/pricing";

function publicProductFields(
  product: ReturnType<typeof toStoreProduct>,
  showPrice: boolean,
) {
  const base = {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    image: product.image,
    minOrderQty: product.minOrderQty,
    stock: product.stock,
    category: product.category,
  };
  if (!showPrice) {
    return { ...base, priceCents: null as number | null };
  }
  return { ...base, priceCents: product.priceCents };
}

export async function GET(request: Request) {
  const session = await getFreshSessionUser();
  const showPrice = Boolean(session);
  const companyId =
    session?.companyStatus === "active" ? session.companyId : null;

  const url = new URL(request.url);
  const sku = url.searchParams.get("sku")?.trim();

  if (sku) {
    const row = await prisma.product.findFirst({
      where: { sku: { equals: sku }, active: true },
      include: {
        datasheets: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        priceTiers: { orderBy: { qtyFrom: "asc" } },
        spareFor: { include: { spareProduct: true } },
      },
    });
    if (!row) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    const product = toStoreProduct(row);
    let priceCents = product.priceCents;
    if (showPrice && companyId) {
      const priced = await resolveUnitPrice({
        productId: product.id,
        quantity: Math.max(1, product.minOrderQty),
        companyId,
      });
      priceCents = priced.unitCents;
    }
    const pricedProduct = { ...product, priceCents };
    return NextResponse.json({
      product: publicProductFields(pricedProduct, showPrice),
    });
  }

  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      datasheets: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      priceTiers: { orderBy: { qtyFrom: "asc" } },
      spareFor: { include: { spareProduct: true } },
    },
  });
  let products = rows.map(toStoreProduct);
  if (showPrice && companyId) {
    products = await applyCompanyListPrices(products, companyId);
  }

  return NextResponse.json({
    products: products.map((p) => publicProductFields(p, showPrice)),
  });
}

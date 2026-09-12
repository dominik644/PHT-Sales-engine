import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { datasheetSchema } from "@/lib/validation";

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const sheets = await prisma.productDatasheet.findMany({
    where: productId ? { productId } : undefined,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { product: { select: { name: true, sku: true, slug: true } } },
  });
  return NextResponse.json({ datasheets: sheets });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = datasheetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const sheet = await prisma.productDatasheet.create({
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, datasheet: sheet });
}

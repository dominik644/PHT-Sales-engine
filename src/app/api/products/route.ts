import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStoreProduct } from "@/lib/catalog";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    products: products.map(toStoreProduct),
  });
}

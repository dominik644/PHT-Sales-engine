import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireActiveB2BUser } from "@/lib/b2b-auth";

export async function GET(request: Request) {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const serial = url.searchParams.get("serial")?.trim();

  const assets = await prisma.customerAsset.findMany({
    where: {
      companyId: session.companyId,
      ...(serial ? { serial: { contains: serial } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const productIds = assets
    .map((a) => a.productId)
    .filter((id): id is string => Boolean(id));

  const spares = productIds.length
    ? await prisma.productSparePart.findMany({
        where: { machineProductId: { in: productIds } },
        include: {
          spareProduct: {
            select: {
              id: true,
              slug: true,
              sku: true,
              name: true,
              priceCents: true,
              stock: true,
              imageUrl: true,
            },
          },
        },
      })
    : [];

  const byMachine = new Map<string, typeof spares>();
  for (const s of spares) {
    const list = byMachine.get(s.machineProductId) ?? [];
    list.push(s);
    byMachine.set(s.machineProductId, list);
  }

  return NextResponse.json({
    assets: assets.map((a) => ({
      id: a.id,
      serial: a.serial,
      name: a.name,
      productId: a.productId,
      installedAt: a.installedAt,
      spareParts: a.productId
        ? (byMachine.get(a.productId) ?? []).map((s) => ({
            id: s.id,
            qtyPerUnit: s.qtyPerUnit,
            note: s.note,
            product: s.spareProduct,
          }))
        : [],
    })),
  });
}

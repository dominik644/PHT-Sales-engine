import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

function csvEscape(value: string | number | boolean | null | undefined): string {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      items: true,
    },
  });

  const header = [
    "number",
    "createdAt",
    "status",
    "company",
    "email",
    "subtotalCents",
    "discountCents",
    "shippingCents",
    "totalCents",
    "paymentTerm",
    "shippingMethod",
    "montageRequested",
    "erpSyncStatus",
    "itemCount",
  ];

  const lines = [header.join(",")];
  for (const order of orders) {
    lines.push(
      [
        csvEscape(order.number),
        csvEscape(order.createdAt.toISOString()),
        csvEscape(order.status),
        csvEscape(order.company?.name ?? ""),
        csvEscape(order.email),
        csvEscape(order.subtotalCents),
        csvEscape(order.discountCents),
        csvEscape(order.shippingCents),
        csvEscape(order.totalCents),
        csvEscape(order.paymentTermLabel ?? ""),
        csvEscape(order.shippingMethodLabel ?? order.shippingMethodCode ?? ""),
        csvEscape(order.montageRequested),
        csvEscape(order.erpSyncStatus),
        csvEscape(order.items.length),
      ].join(","),
    );
  }

  const body = lines.join("\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pht-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

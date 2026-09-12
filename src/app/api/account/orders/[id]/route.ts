import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFreshSessionUser } from "@/lib/b2b-auth";
import { canApprove } from "@/lib/approvals";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getFreshSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      items: true,
      approvals: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      events: { orderBy: { createdAt: "asc" } },
      invoice: true,
      requester: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        lineTotalCents: item.unitCents * item.quantity,
      })),
      canApprove: canApprove(user.role, order.status),
    },
  });
}

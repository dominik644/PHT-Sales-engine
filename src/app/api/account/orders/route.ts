import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireActiveB2BUser } from "@/lib/b2b-auth";
import { approvalSchema } from "@/lib/validation";
import { approveOrder, canApprove, rejectOrder } from "@/lib/approvals";

function serializeOrder(
  order: Awaited<ReturnType<typeof loadOrders>>[number],
  role: string,
) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    email: order.email,
    name: order.name,
    addressLine1: order.addressLine1,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    discountCode: order.discountCode,
    erpSyncStatus: order.erpSyncStatus,
    erpOrderId: order.erpOrderId,
    erpInvoiceId: order.erpInvoiceId,
    requester: order.requester
      ? {
          id: order.requester.id,
          name: order.requester.name,
          email: order.requester.email,
          role: order.requester.role,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitCents: item.unitCents,
      lineTotalCents: item.unitCents * item.quantity,
    })),
    approvals: order.approvals.map((a) => ({
      id: a.id,
      role: a.role,
      decision: a.decision,
      note: a.note,
      createdAt: a.createdAt,
      user: { name: a.user.name, email: a.user.email },
    })),
    events: order.events.map((e) => ({
      id: e.id,
      type: e.type,
      message: e.message,
      createdAt: e.createdAt,
    })),
    invoice: order.invoice
      ? {
          number: order.invoice.number,
          status: order.invoice.status,
          amountCents: order.invoice.amountCents,
          erpInvoiceId: order.invoice.erpInvoiceId,
          issuedAt: order.invoice.issuedAt,
        }
      : null,
    canApprove: canApprove(role, order.status),
  };
}

async function loadOrders(companyId: string) {
  return prisma.order.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
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
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  let orders = await loadOrders(user.companyId);

  if (status === "open") {
    orders = orders.filter((o) =>
      ["awaiting_production_approval", "awaiting_purchasing_approval", "approved"].includes(
        o.status,
      ),
    );
  } else if (status === "history") {
    orders = orders.filter((o) =>
      ["confirmed", "rejected", "cancelled"].includes(o.status),
    );
  } else if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  if (q) {
    orders = orders.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)) ||
        (o.invoice?.number ?? "").toLowerCase().includes(q) ||
        (o.erpOrderId ?? "").toLowerCase().includes(q),
    );
  }

  const serialized = orders.map((o) => serializeOrder(o, user.role));
  const allForStats = await prisma.order.findMany({
    where: { companyId: user.companyId },
    select: { status: true, totalCents: true },
  });

  const confirmed = allForStats.filter((o) => o.status === "confirmed");
  const stats = {
    orderCount: allForStats.length,
    confirmedCount: confirmed.length,
    openCount: allForStats.filter((o) =>
      o.status.startsWith("awaiting_") || o.status === "approved",
    ).length,
    totalSpentCents: confirmed.reduce((sum, o) => sum + o.totalCents, 0),
  };

  return NextResponse.json({ orders: serialized, stats });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const parsed = approvalSchema.safeParse(body);
  if (!orderId || !parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, companyId: user.companyId },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    if (parsed.data.decision === "approved") {
      const updated = await approveOrder({
        orderId,
        userId: user.id,
        role: user.role,
        note: parsed.data.note ?? undefined,
      });
      const freshList = await loadOrders(user.companyId);
      const fresh = freshList.find((o) => o.id === updated.id);
      return NextResponse.json({
        ok: true,
        order: fresh ? serializeOrder(fresh, user.role) : null,
      });
    }

    await rejectOrder({
      orderId,
      userId: user.id,
      role: user.role,
      note: parsed.data.note ?? undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Approval failed";
    const status =
      message === "FORBIDDEN_APPROVAL"
        ? 403
        : message === "ORDER_NOT_FOUND"
          ? 404
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

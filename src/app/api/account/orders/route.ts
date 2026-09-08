import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireActiveB2BUser } from "@/lib/b2b-auth";
import { approvalSchema } from "@/lib/validation";
import { approveOrder, canApprove, rejectOrder } from "@/lib/approvals";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      approvals: true,
      invoice: true,
    },
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      canApprove: canApprove(user.role, order.status),
    })),
  });
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
      const fresh = await prisma.order.findUnique({
        where: { id: updated.id },
        include: { invoice: true },
      });
      return NextResponse.json({ ok: true, order: fresh });
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

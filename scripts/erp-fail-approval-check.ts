import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  process.env.ERP_PROVIDER = "rest";
  process.env.ERP_BASE_URL = "http://127.0.0.1:9";
  process.env.ERP_API_KEY = "x";

  const { approveOrder } = await import("../src/lib/approvals.ts");
  const { ROLES } = await import("../src/lib/b2b-auth.ts");

  let order = await prisma.order.findFirst({
    where: { status: "awaiting_purchasing_approval" },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    const prod = await prisma.order.findFirst({
      where: { status: "awaiting_production_approval" },
      orderBy: { createdAt: "desc" },
    });
    if (!prod) {
      console.log(JSON.stringify({ skipped: true, reason: "no pending orders" }));
      return;
    }
    const pm = await prisma.user.findFirst({
      where: { role: ROLES.PRODUCTION_MANAGER, companyId: prod.companyId },
    });
    if (!pm) throw new Error("missing production manager");
    order = await approveOrder({
      orderId: prod.id,
      userId: pm.id,
      role: pm.role,
      note: "advance",
    });
  }

  if (order.status !== "awaiting_purchasing_approval") {
    console.log(JSON.stringify({ skipped: true, status: order.status }));
    return;
  }

  const buyer = await prisma.user.findFirst({
    where: { role: ROLES.PURCHASING, companyId: order.companyId },
  });
  if (!buyer) throw new Error("missing purchasing user");

  const updated = await approveOrder({
    orderId: order.id,
    userId: buyer.id,
    role: buyer.role,
    note: "erp-fail-check",
  });

  const events = await prisma.orderEvent.findMany({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const ok =
    updated.status === "approved" &&
    events.some(
      (e) =>
        String(e.type).includes("erp_failed") ||
        String(e.message).toLowerCase().includes("erp"),
    );

  console.log(
    JSON.stringify(
      {
        ok,
        status: updated.status,
        erpSyncStatus: updated.erpSyncStatus,
        events: events.map((e) => ({ type: e.type, message: e.message })),
      },
      null,
      2,
    ),
  );
  if (!ok) process.exit(1);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

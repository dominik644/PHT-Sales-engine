import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/b2b-auth";
import { pushOrderAndInvoiceToErp } from "@/lib/erp/sync";

export function nextApprovalStatus(current: string): string | null {
  if (current === "awaiting_production_approval") {
    return "awaiting_purchasing_approval";
  }
  if (current === "awaiting_purchasing_approval") {
    return "approved";
  }
  return null;
}

export function requiredRoleForStatus(status: string): string | null {
  if (status === "awaiting_production_approval") {
    return ROLES.PRODUCTION_MANAGER;
  }
  if (status === "awaiting_purchasing_approval") {
    return ROLES.PURCHASING;
  }
  return null;
}

export function canApprove(role: string, orderStatus: string): boolean {
  const required = requiredRoleForStatus(orderStatus);
  if (!required) return false;
  if (role === ROLES.COMPANY_ADMIN) {
    // Admin darf beide Freigabestufen ersetzen
    return true;
  }
  return role === required;
}

export async function approveOrder(options: {
  orderId: string;
  userId: string;
  role: string;
  note?: string;
}) {
  const order = await prisma.order.findUnique({ where: { id: options.orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (!canApprove(options.role, order.status)) {
    throw new Error("FORBIDDEN_APPROVAL");
  }

  const actingRole =
    options.role === ROLES.COMPANY_ADMIN
      ? requiredRoleForStatus(order.status)!
      : options.role;

  const next = nextApprovalStatus(order.status);
  if (!next) throw new Error("INVALID_STATUS");

  await prisma.orderApproval.create({
    data: {
      orderId: order.id,
      userId: options.userId,
      role: actingRole,
      decision: "approved",
      note: options.note,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "approved_step",
      message: `Freigabe ${actingRole} → ${next}`,
    },
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: next },
  });

  if (next === "approved") {
    // Nach finaler Einkaufsfreigabe: Auftrag + Rechnung im ERP anlegen
    await pushOrderAndInvoiceToErp(order.id);
  }

  return updated;
}

export async function rejectOrder(options: {
  orderId: string;
  userId: string;
  role: string;
  note?: string;
}) {
  const order = await prisma.order.findUnique({ where: { id: options.orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (!canApprove(options.role, order.status)) {
    throw new Error("FORBIDDEN_APPROVAL");
  }

  const actingRole =
    options.role === ROLES.COMPANY_ADMIN
      ? requiredRoleForStatus(order.status)!
      : options.role;

  await prisma.$transaction([
    prisma.orderApproval.create({
      data: {
        orderId: order.id,
        userId: options.userId,
        role: actingRole,
        decision: "rejected",
        note: options.note,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "rejected", erpSyncStatus: "skipped" },
    }),
    prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "rejected",
        message: `Abgelehnt durch ${actingRole}${options.note ? `: ${options.note}` : ""}`,
      },
    }),
  ]);
}

import { prisma } from "@/lib/db";
import { getErpAdapter } from "@/lib/erp";
import type { ErpOrderPayload } from "@/lib/erp";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function syncProductsFromErp() {
  const erp = getErpAdapter();
  const products = await erp.fetchProducts();
  let upserted = 0;

  for (const p of products) {
    const slug = slugify(p.name) || slugify(p.sku);
    await prisma.product.upsert({
      where: { sku: p.sku },
      create: {
        erpId: p.erpId,
        sku: p.sku,
        slug,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        stock: p.stock,
        active: p.active,
      },
      update: {
        erpId: p.erpId,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        stock: p.stock,
        active: p.active,
      },
    });
    upserted += 1;
  }

  await prisma.erpSyncLog.create({
    data: {
      direction: "inbound",
      entity: "product",
      status: "ok",
      detail: `Synced ${upserted} products via ${erp.name}`,
    },
  });

  return { upserted, provider: erp.name };
}

export async function pushOrderToErp(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  const payload: ErpOrderPayload = {
    orderNumber: order.number,
    email: order.email,
    name: order.name,
    addressLine1: order.addressLine1,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    items: order.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitCents: item.unitCents,
    })),
  };

  try {
    const erp = getErpAdapter();
    const result = await erp.pushOrder(payload);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        erpSyncStatus: "synced",
        erpOrderId: result.erpOrderId,
        erpLastError: null,
        status: "confirmed",
      },
    });
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "erp_synced",
        message: `Pushed to ERP (${erp.name}) as ${result.erpOrderId}`,
      },
    });
    await prisma.erpSyncLog.create({
      data: {
        direction: "outbound",
        entity: "order",
        status: "ok",
        detail: `${order.number} → ${result.erpOrderId}`,
      },
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ERP error";
    await prisma.order.update({
      where: { id: order.id },
      data: {
        erpSyncStatus: "failed",
        erpLastError: message,
      },
    });
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "erp_failed",
        message,
      },
    });
    await prisma.erpSyncLog.create({
      data: {
        direction: "outbound",
        entity: "order",
        status: "error",
        detail: `${order.number}: ${message}`,
      },
    });
    throw error;
  }
}

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
        purpose: (p as { purpose?: string }).purpose ?? "",
        manufacturerSku: (p as { manufacturerSku?: string | null }).manufacturerSku ?? null,
        priceCents: p.priceCents,
        currency: p.currency,
        vatRateBps: (p as { vatRateBps?: number }).vatRateBps ?? 1900,
        imageUrl: p.imageUrl,
        stock: p.stock,
        minOrderQty: (p as { minOrderQty?: number }).minOrderQty ?? 1,
        active: p.active,
      },
      update: {
        erpId: p.erpId,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        description: p.description,
        // purpose/manufacturerSku/minOrderQty bleiben lokal, falls ERP sie nicht liefert
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        stock: p.stock,
        active: p.active,
        ...(((p as { vatRateBps?: number }).vatRateBps != null)
          ? { vatRateBps: (p as { vatRateBps?: number }).vatRateBps }
          : {}),
        ...(((p as { manufacturerSku?: string | null }).manufacturerSku != null)
          ? { manufacturerSku: (p as { manufacturerSku?: string | null }).manufacturerSku }
          : {}),
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

/** Nach finaler Freigabe: Auftrag + Rechnung im ERP erzeugen */
export async function pushOrderAndInvoiceToErp(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, company: true },
  });
  if (!order) throw new Error("Order not found");

  const payload: ErpOrderPayload = {
    orderNumber: order.number,
    companyName: order.company?.name,
    erpCustomerId: order.company?.erpCustomerId,
    email: order.email,
    name: order.name,
    addressLine1: order.addressLine1,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    discountCode: order.discountCode,
    paymentTermLabel: order.paymentTermLabel,
    paymentTermSnapshot: order.paymentTermSnapshot,
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

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          erpSyncStatus: "synced",
          erpOrderId: result.erpOrderId,
          erpInvoiceId: result.erpInvoiceId,
          erpLastError: null,
          status: "confirmed",
        },
      }),
      prisma.invoice.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          number: result.invoiceNumber,
          erpInvoiceId: result.erpInvoiceId,
          amountCents: order.totalCents,
          currency: order.currency,
          status: "open",
        },
        update: {
          number: result.invoiceNumber,
          erpInvoiceId: result.erpInvoiceId,
          amountCents: order.totalCents,
        },
      }),
      prisma.orderEvent.create({
        data: {
          orderId: order.id,
          type: "erp_order_invoice",
          message: `ERP Auftrag ${result.erpOrderId}, Rechnung ${result.invoiceNumber}`,
        },
      }),
      prisma.erpSyncLog.create({
        data: {
          direction: "outbound",
          entity: "order+invoice",
          status: "ok",
          detail: `${order.number} → ${result.erpOrderId} / ${result.erpInvoiceId}`,
        },
      }),
    ]);

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
        entity: "order+invoice",
        status: "error",
        detail: `${order.number}: ${message}`,
      },
    });
    throw error;
  }
}

/** @deprecated use pushOrderAndInvoiceToErp */
export const pushOrderToErp = pushOrderAndInvoiceToErp;

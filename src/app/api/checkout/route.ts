import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { enforceRateLimit, hashIp } from "@/lib/security";
import { pushOrderToErp } from "@/lib/erp/sync";

function orderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PHT-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limited = await enforceRateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 },
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 409 },
      );
    }
  }

  const lineData = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitCents: product.priceCents,
      quantity: item.quantity,
    };
  });

  const subtotalCents = lineData.reduce(
    (sum, line) => sum + line.unitCents * line.quantity,
    0,
  );

  const customer = await prisma.customer.upsert({
    where: { email: input.email.toLowerCase() },
    create: {
      email: input.email.toLowerCase(),
      name: input.name,
    },
    update: { name: input.name },
  });

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error("STOCK_CONFLICT");
      }
    }

    return tx.order.create({
      data: {
        number: orderNumber(),
        status: "pending",
        customerId: customer.id,
        email: input.email.toLowerCase(),
        name: input.name,
        addressLine1: input.address,
        city: input.city,
        postalCode: input.postal,
        country: input.country,
        subtotalCents,
        ipHash: hashIp(ip),
        userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
        items: { create: lineData },
        events: {
          create: {
            type: "created",
            message: "Order created from secure checkout",
          },
        },
      },
      include: { items: true },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "STOCK_CONFLICT") {
      return null;
    }
    throw error;
  });

  if (!order) {
    return NextResponse.json(
      { error: "Stock changed during checkout. Please refresh and try again." },
      { status: 409 },
    );
  }

  let erpOrderId: string | null = null;
  let erpSyncStatus = order.erpSyncStatus;
  try {
    const result = await pushOrderToErp(order.id);
    erpOrderId = result.erpOrderId;
    erpSyncStatus = "synced";
  } catch {
    erpSyncStatus = "failed";
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      number: order.number,
      subtotalCents: order.subtotalCents,
      erpSyncStatus,
      erpOrderId,
    },
  });
}

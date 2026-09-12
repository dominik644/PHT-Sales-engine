import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { enforceRateLimit, hashIp } from "@/lib/security";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { resolveDiscount } from "@/lib/discounts";

function orderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PHT-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (message === "COMPANY_INACTIVE") {
      return NextResponse.json(
        { error: "Firma noch nicht freigeschaltet. Bitte auf PHT-Freigabe warten." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Bitte als B2B-Kunde anmelden." },
      { status: 401 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limited = await enforceRateLimit(`checkout:${session.id}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Checkout-Versuche." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    include: { defaultPaymentTerm: true },
  });
  if (!company || company.status !== "active") {
    return NextResponse.json(
      { error: "Firma nicht aktiv." },
      { status: 403 },
    );
  }

  const paymentTerm = await prisma.paymentTerm.findFirst({
    where: { id: input.paymentTermId, active: true },
  });
  if (!paymentTerm) {
    return NextResponse.json(
      { error: "Ungültige Zahlungsbedingung." },
      { status: 400 },
    );
  }

  const paymentTermSnapshot = JSON.stringify({
    code: paymentTerm.code,
    name: paymentTerm.name,
    description: paymentTerm.description,
    depositPercent: paymentTerm.depositPercent,
    balancePercent: paymentTerm.balancePercent,
    balanceDueDays: paymentTerm.balanceDueDays,
  });
  const paymentTermLabel = `${paymentTerm.name} (${paymentTerm.depositPercent}/${paymentTerm.balancePercent}${
    paymentTerm.balanceDueDays
      ? `, Rest in ${paymentTerm.balanceDueDays} Tagen`
      : paymentTerm.balancePercent > 0
        ? ", Rest bei Lieferung"
        : ""
  })`;

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produkt nicht gefunden: ${item.productId}` },
        { status: 400 },
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Nicht genug Bestand für ${product.name}` },
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

  const applied = await resolveDiscount({
    code: input.discountCode,
    companyId: company.id,
    subtotalCents,
  });

  const discountCents = applied?.discountCents ?? 0;
  const totalCents = subtotalCents - discountCents;

  const order = await prisma
    .$transaction(async (tx) => {
      for (const item of input.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new Error("STOCK_CONFLICT");
      }

      return tx.order.create({
        data: {
          number: orderNumber(),
          status: "awaiting_production_approval",
          companyId: company.id,
          requesterId: session.id,
          email: session.email,
          name: session.name,
          addressLine1: input.address,
          city: input.city,
          postalCode: input.postal,
          country: input.country,
          subtotalCents,
          discountCents,
          totalCents,
          discountId: applied?.id,
          discountCode: applied?.code,
          paymentTermId: paymentTerm.id,
          paymentTermLabel,
          paymentTermSnapshot,
          erpSyncStatus: "pending",
          ipHash: hashIp(ip),
          userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
          items: { create: lineData },
          events: {
            create: {
              type: "created",
              message: `B2B-Auftrag erstellt (${paymentTermLabel}) — wartet auf Freigabe Produktionsleiter`,
            },
          },
        },
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.message === "STOCK_CONFLICT") {
        return null;
      }
      throw error;
    });

  if (!order) {
    return NextResponse.json(
      { error: "Bestand hat sich geändert. Bitte erneut versuchen." },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      totalCents: order.totalCents,
      discountCode: order.discountCode,
      paymentTermLabel: order.paymentTermLabel,
      erpSyncStatus: order.erpSyncStatus,
      message:
        "Auftrag eingereicht. Nächster Schritt: Freigabe durch Produktionsleiter, danach Einkauf. Erst dann erstellt das ERP Auftrag und Rechnung.",
    },
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { enforceRateLimit, hashIp } from "@/lib/security";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { canPlaceOrders } from "@/lib/order-permissions";
import { resolveDiscount } from "@/lib/discounts";
import { resolveUnitPrice } from "@/lib/pricing";
import { listShippingOptions } from "@/lib/shipping";

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

  if (!canPlaceOrders(session.role)) {
    return NextResponse.json(
      {
        error:
          "Als Anforderer können Sie keine verbindlichen Bestellungen auslösen. Bitte Einkauf oder Firmen-Admin kontaktieren.",
      },
      { status: 403 },
    );
  }

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

  let paymentTerm = await prisma.paymentTerm.findFirst({
    where: { id: input.paymentTermId, active: true },
  });

  if (company.requiresPrepaid) {
    const vorkasse = await prisma.paymentTerm.findFirst({
      where: { code: "VORKASSE", active: true },
    });
    if (!vorkasse) {
      return NextResponse.json(
        { error: "Vorauskasse nicht konfiguriert." },
        { status: 500 },
      );
    }
    paymentTerm = vorkasse;
  } else if (
    company.defaultPaymentTermId &&
    (!paymentTerm || paymentTerm.id !== company.defaultPaymentTermId)
  ) {
    // Prefer company default when client sent something else without override intent —
    // still allow selecting other non-prepaid terms if provided and active.
    if (!paymentTerm) {
      paymentTerm = company.defaultPaymentTerm;
    }
  }

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

  const partialMessages: string[] = [];

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produkt nicht gefunden: ${item.productId}` },
        { status: 400 },
      );
    }
    if (product.stock <= 0) {
      return NextResponse.json(
        { error: `Nicht lieferbar: ${product.name}` },
        { status: 409 },
      );
    }
    if (item.quantity < product.minOrderQty) {
      return NextResponse.json(
        {
          error: `Mindestbestellmenge für ${product.name} ist ${product.minOrderQty}.`,
        },
        { status: 400 },
      );
    }
    if (product.stock < item.quantity) {
      partialMessages.push(
        `${product.name}: ${product.stock} sofort, ${item.quantity - product.stock} Nachlieferung`,
      );
    }
  }

  const lineData: Array<{
    productId: string;
    sku: string;
    name: string;
    unitCents: number;
    quantity: number;
    stockAtOrder: number;
    availableNowQty: number;
    backorderQty: number;
  }> = [];
  for (const item of input.items) {
    const product = byId.get(item.productId)!;
    const priced = await resolveUnitPrice({
      productId: product.id,
      quantity: item.quantity,
      companyId: company.id,
    });
    const availableNowQty = Math.min(product.stock, item.quantity);
    const backorderQty = Math.max(0, item.quantity - availableNowQty);
    lineData.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitCents: priced.unitCents,
      quantity: item.quantity,
      stockAtOrder: product.stock,
      availableNowQty,
      backorderQty,
    });
  }

  const subtotalCents = lineData.reduce(
    (sum, line) => sum + line.unitCents * line.quantity,
    0,
  );

  const shippingOptions = await listShippingOptions(subtotalCents);
  const shipping = shippingOptions.find(
    (s) => s.code === input.shippingMethodCode,
  );
  if (!shipping) {
    return NextResponse.json(
      { error: "Ungültige Versandart." },
      { status: 400 },
    );
  }
  const shippingCents = shipping.cents;

  const applied = await resolveDiscount({
    code: input.discountCode,
    companyId: company.id,
    subtotalCents,
  });

  const discountCents = applied?.discountCents ?? 0;
  const totalCents = subtotalCents - discountCents + shippingCents;
  const montageRequested = Boolean(input.montageRequested);
  const montageNote = input.montageNote?.trim() || null;

  const order = await prisma
    .$transaction(async (tx) => {
      for (const item of input.items) {
        const product = byId.get(item.productId)!;
        const deduct = Math.min(product.stock, item.quantity);
        if (deduct > 0) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: deduct },
            },
            data: { stock: { decrement: deduct } },
          });
          if (updated.count !== 1) throw new Error("STOCK_CONFLICT");
        }
      }

      const partialNote =
        partialMessages.length > 0
          ? ` Teillieferung: ${partialMessages.join("; ")}.`
          : "";

      return tx.order.create({
        data: {
          number: orderNumber(),
          status:
            company.approvalThresholdCents != null &&
            totalCents < company.approvalThresholdCents
              ? "awaiting_purchasing_approval"
              : "awaiting_production_approval",
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
          shippingCents,
          totalCents,
          discountId: applied?.id,
          discountCode: applied?.code,
          paymentTermId: paymentTerm.id,
          paymentTermLabel,
          paymentTermSnapshot,
          shippingMethodCode: shipping.code,
          shippingMethodLabel: shipping.name,
          montageRequested,
          montageNote,
          erpSyncStatus: "pending",
          ipHash: hashIp(ip),
          userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
          items: { create: lineData },
          events: {
            create: {
              type: "created",
              message: `B2B-Auftrag erstellt (${paymentTermLabel}, ${shipping.name}${
                montageRequested ? ", Montage gewünscht" : ""
              }) — Freigabeprozess gestartet.${partialNote}`,
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

  const nextStep =
    order.status === "awaiting_purchasing_approval"
      ? "Nächster Schritt: Freigabe durch Einkauf (Produktionsschwelle unterschritten)."
      : "Nächster Schritt: Freigabe durch Produktionsleiter, danach Einkauf.";
  const erpHint =
    " Erst dann erstellt das ERP Auftrag und Rechnung.";

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      discountCode: order.discountCode,
      paymentTermLabel: order.paymentTermLabel,
      shippingMethodLabel: order.shippingMethodLabel,
      montageRequested: order.montageRequested,
      erpSyncStatus: order.erpSyncStatus,
      partialStock: partialMessages,
      message:
        partialMessages.length > 0
          ? `Auftrag eingereicht mit Teillieferung (${partialMessages.join("; ")}). ${nextStep}`
          : `Auftrag eingereicht. ${nextStep}${erpHint}`,
    },
  });
}

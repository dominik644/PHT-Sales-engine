import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { canPlaceOrders } from "@/lib/order-permissions";
import { sendMail } from "@/lib/mail";
import { listShippingOptions } from "@/lib/shipping";

function orderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PHT-${stamp}-${rand}`;
}

/**
 * Angebot annehmen → verbindlicher Auftrag (Freigabeprozess).
 * Nur Einkauf / Firmen-Admin — nicht REQUESTER.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPlaceOrders(session.role)) {
    return NextResponse.json(
      {
        error:
          "Als Anforderer können Sie Angebote nicht verbindlich annehmen. Bitte Einkauf kontaktieren.",
      },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const quote = await prisma.quoteRequest.findFirst({
    where: { id, companyId: session.companyId },
    include: { items: true, company: true },
  });
  if (!quote) {
    return NextResponse.json({ error: "Angebot nicht gefunden" }, { status: 404 });
  }
  if (quote.status !== "offered") {
    return NextResponse.json(
      { error: "Angebot ist nicht im Status „offered“." },
      { status: 409 },
    );
  }
  if (quote.validUntil && quote.validUntil.getTime() < Date.now()) {
    await prisma.quoteRequest.update({
      where: { id: quote.id },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "Angebot abgelaufen." }, { status: 410 });
  }
  if (!quote.offeredTotalCents || quote.offeredTotalCents <= 0) {
    return NextResponse.json(
      { error: "Angebot hat keinen gültigen Gesamtpreis." },
      { status: 400 },
    );
  }

  const company = quote.company;
  const paymentTerm = company.defaultPaymentTermId
    ? await prisma.paymentTerm.findFirst({
        where: { id: company.defaultPaymentTermId, active: true },
      })
    : await prisma.paymentTerm.findFirst({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      });
  if (!paymentTerm) {
    return NextResponse.json(
      { error: "Keine Zahlungsbedingung konfiguriert." },
      { status: 500 },
    );
  }

  const shippingOptions = await listShippingOptions(quote.offeredTotalCents);
  const shipping = shippingOptions[0];
  if (!shipping) {
    return NextResponse.json(
      { error: "Keine Versandart verfügbar." },
      { status: 500 },
    );
  }

  const skus = quote.items.map((i) => i.sku);
  const products = await prisma.product.findMany({
    where: { sku: { in: skus }, active: true },
  });
  const bySku = new Map(products.map((p) => [p.sku, p]));

  const totalQty = Math.max(
    1,
    quote.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const fallbackUnit = Math.round(quote.offeredTotalCents / totalQty);

  const lineData = quote.items.map((item) => {
    const product = bySku.get(item.sku);
    const unitCents = item.unitCents ?? fallbackUnit;
    return {
      productId: product?.id,
      sku: item.sku,
      name: item.name,
      unitCents,
      quantity: item.quantity,
      stockAtOrder: product?.stock ?? 0,
      availableNowQty: product ? Math.min(product.stock, item.quantity) : 0,
      backorderQty: product
        ? Math.max(0, item.quantity - product.stock)
        : item.quantity,
    };
  });

  if (lineData.some((l) => !l.productId)) {
    return NextResponse.json(
      {
        error:
          "Mindestens eine Angebotsposition ist keinem Produkt zuordenbar.",
      },
      { status: 400 },
    );
  }

  const subtotalCents = lineData.reduce(
    (sum, l) => sum + l.unitCents * l.quantity,
    0,
  );
  const shippingCents = shipping.cents;
  const totalCents = subtotalCents + shippingCents;

  const paymentTermLabel = `${paymentTerm.name} (${paymentTerm.depositPercent}/${paymentTerm.balancePercent})`;
  const paymentTermSnapshot = JSON.stringify({
    code: paymentTerm.code,
    name: paymentTerm.name,
    depositPercent: paymentTerm.depositPercent,
    balancePercent: paymentTerm.balancePercent,
    balanceDueDays: paymentTerm.balanceDueDays,
  });

  const initialStatus =
    company.approvalThresholdCents != null &&
    totalCents < company.approvalThresholdCents
      ? "awaiting_purchasing_approval"
      : "awaiting_production_approval";

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: orderNumber(),
          status: initialStatus,
          companyId: company.id,
          requesterId: session.id,
          email: session.email,
          name: session.name,
          addressLine1: company.addressLine1,
          city: company.city,
          postalCode: company.postalCode,
          country: company.country,
          subtotalCents,
          discountCents: 0,
          shippingCents,
          totalCents,
          paymentTermId: paymentTerm.id,
          paymentTermLabel,
          paymentTermSnapshot,
          shippingMethodCode: shipping.code,
          shippingMethodLabel: shipping.name,
          montageRequested: false,
          erpSyncStatus: "pending",
          items: {
            create: lineData.map((l) => ({
              productId: l.productId!,
              sku: l.sku,
              name: l.name,
              unitCents: l.unitCents,
              quantity: l.quantity,
              stockAtOrder: l.stockAtOrder,
              availableNowQty: l.availableNowQty,
              backorderQty: l.backorderQty,
            })),
          },
          events: {
            create: {
              type: "created_from_quote",
              message: `Auftrag aus Angebot ${quote.number} angenommen — Freigabe gestartet.`,
            },
          },
        },
      });

      await tx.quoteRequest.update({
        where: { id: quote.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
          acceptedOrderId: created.id,
        },
      });

      return created;
    });

    await sendMail({
      to: session.email,
      subject: `Angebot ${quote.number} angenommen → ${order.number}`,
      text: `Guten Tag ${session.name},\n\nSie haben Angebot ${quote.number} angenommen. Auftrag ${order.number} wurde angelegt (Status: ${order.status}).\n\nPHT B2B`,
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        totalCents: order.totalCents,
      },
      quoteId: quote.id,
    });
  } catch (error) {
    console.error("[quote-accept]", error);
    return NextResponse.json(
      { error: "Annahme fehlgeschlagen." },
      { status: 500 },
    );
  }
}

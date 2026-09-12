import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { enforceRateLimit } from "@/lib/security";

const serviceSchema = z.object({
  type: z.enum(["montage", "wartung", "service"]),
  preferredDate: z.string().datetime().optional().nullable(),
  note: z.string().trim().max(2000).optional().default(""),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
});

function serviceNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `SV-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (message === "COMPANY_INACTIVE") {
      return NextResponse.json(
        { error: "Firma noch nicht freigeschaltet." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Bitte als B2B-Kunde anmelden." },
      { status: 401 },
    );
  }

  const limited = await enforceRateLimit(`service:${session.id}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Anfragen." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = serviceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.productId) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, active: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden." },
        { status: 400 },
      );
    }
  }
  if (input.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, companyId: session.companyId },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Auftrag nicht gefunden." },
        { status: 400 },
      );
    }
  }

  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      number: serviceNumber(),
      companyId: session.companyId,
      type: input.type,
      preferredDate: input.preferredDate
        ? new Date(input.preferredDate)
        : null,
      note: input.note ?? "",
      productId: input.productId || null,
      orderId: input.orderId || null,
      status: "open",
    },
  });

  return NextResponse.json({ ok: true, serviceRequest });
}

export async function GET() {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ serviceRequests: requests });
}

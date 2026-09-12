import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { enforceRateLimit } from "@/lib/security";

const quoteSchema = z.object({
  note: z.string().trim().max(2000).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        sku: z.string().trim().min(1).max(80),
        name: z.string().trim().min(1).max(200),
        quantity: z.number().int().min(1).max(10_000),
        note: z.string().trim().max(500).optional().default(""),
      }),
    )
    .min(1)
    .max(100),
});

function quoteNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `AN-${stamp}-${rand}`;
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

  const limited = await enforceRateLimit(`quotes:${session.id}`, 20, 60_000);
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
  const parsed = quoteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const skus = input.items.map((i) => i.sku);
  const products = await prisma.product.findMany({
    where: { sku: { in: skus }, active: true },
    select: { id: true, sku: true },
  });
  const bySku = new Map(products.map((p) => [p.sku, p.id]));

  const quote = await prisma.quoteRequest.create({
    data: {
      number: quoteNumber(),
      companyId: session.companyId,
      requesterId: session.id,
      status: "open",
      note: input.note ?? "",
      items: {
        create: input.items.map((item) => ({
          productId: item.productId || bySku.get(item.sku) || null,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          note: item.note ?? "",
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, quote });
}

export async function GET() {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await prisma.quoteRequest.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 50,
  });

  return NextResponse.json({ quotes });
}

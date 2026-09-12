import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { sendMail } from "@/lib/mail";

const ALLOWED = ["open", "in_progress", "offered", "accepted", "rejected", "expired"];

const offerSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "in_progress", "offered", "accepted", "rejected", "expired"]),
  offeredTotalCents: z.number().int().positive().optional().nullable(),
  offeredNote: z.string().trim().max(2000).optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        unitCents: z.number().int().min(0),
      }),
    )
    .optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      company: { select: { name: true } },
      items: true,
      requester: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json({
    quotes: quotes.map((q) => ({
      id: q.id,
      number: q.number,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
      note: q.note,
      offeredTotalCents: q.offeredTotalCents,
      offeredNote: q.offeredNote,
      offeredAt: q.offeredAt?.toISOString() ?? null,
      validUntil: q.validUntil?.toISOString() ?? null,
      company: q.company,
      requester: q.requester,
      items: q.items.map((i) => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        unitCents: i.unitCents,
        note: i.note,
      })),
    })),
  });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = offerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  if (!ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.quoteRequest.findUnique({
    where: { id: body.id },
    include: {
      items: true,
      requester: { select: { email: true, name: true } },
      company: { select: { name: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const itemsDerivedTotal = body.items?.length
    ? body.items.reduce((sum, line) => {
        const item = existing.items.find((i) => i.id === line.id);
        return sum + line.unitCents * (item?.quantity ?? 0);
      }, 0)
    : null;

  const offeredTotal =
    body.offeredTotalCents ??
    (itemsDerivedTotal && itemsDerivedTotal > 0 ? itemsDerivedTotal : null) ??
    existing.offeredTotalCents ??
    null;

  if (body.status === "offered" && (!offeredTotal || offeredTotal <= 0)) {
    return NextResponse.json(
      {
        error:
          "Für Status „offered“ bitte offeredTotalCents oder Positionspreise setzen.",
      },
      { status: 400 },
    );
  }

  const quote = await prisma.$transaction(async (tx) => {
    if (body.items?.length) {
      for (const line of body.items) {
        await tx.quoteRequestItem.updateMany({
          where: { id: line.id, quoteRequestId: body.id },
          data: { unitCents: line.unitCents },
        });
      }
    }

    return tx.quoteRequest.update({
      where: { id: body.id },
      data: {
        status: body.status,
        ...(body.offeredNote != null ? { offeredNote: body.offeredNote } : {}),
        ...(body.validUntil !== undefined
          ? {
              validUntil: body.validUntil ? new Date(body.validUntil) : null,
            }
          : {}),
        ...(body.status === "offered"
          ? {
              offeredAt: new Date(),
              offeredTotalCents: offeredTotal!,
            }
          : body.offeredTotalCents != null
            ? { offeredTotalCents: body.offeredTotalCents }
            : {}),
      },
      include: { items: true },
    });
  });

  if (
    body.status === "offered" &&
    existing.requester?.email &&
    existing.status !== "offered"
  ) {
    await sendMail({
      to: existing.requester.email,
      subject: `Angebot ${quote.number} liegt vor`,
      text: `Guten Tag ${existing.requester.name},\n\nIhr Angebot ${quote.number} für ${existing.company.name} ist verfügbar${
        quote.offeredTotalCents
          ? ` (Gesamt ${quote.offeredTotalCents} Cent)`
          : ""
      }.${quote.offeredNote ? `\n\nHinweis: ${quote.offeredNote}` : ""}\n\nBitte im Kundenkonto annehmen.\n\nPHT Vertrieb`,
    });
  }

  return NextResponse.json({ ok: true, quote });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveB2BUser } from "@/lib/b2b-auth";
import { enforceRateLimit } from "@/lib/security";
import { sendMail } from "@/lib/mail";

const ticketSchema = z.object({
  type: z.enum(["return", "complaint", "spare", "other"]),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(5).max(4000),
  orderId: z.string().optional().nullable(),
});

function ticketNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `TK-${stamp}-${rand}`;
}

export async function GET() {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ tickets });
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

  const limited = await enforceRateLimit(`tickets:${session.id}`, 20, 60_000);
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
  const parsed = ticketSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
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

  const ticket = await prisma.supportTicket.create({
    data: {
      number: ticketNumber(),
      companyId: session.companyId,
      requesterId: session.id,
      type: input.type,
      subject: input.subject,
      message: input.message,
      orderId: input.orderId || null,
      status: "open",
    },
  });

  await sendMail({
    to: process.env.SUPPORT_INBOX ?? "service@pht.local",
    subject: `[Ticket ${ticket.number}] ${ticket.subject}`,
    text: `Neues Support-Ticket ${ticket.number}\nTyp: ${ticket.type}\nFirma: ${session.companyName}\nVon: ${session.name} <${session.email}>\n\n${ticket.message}`,
  });

  await sendMail({
    to: session.email,
    subject: `Ticket ${ticket.number} eingegangen`,
    text: `Guten Tag ${session.name},\n\nIhr Ticket ${ticket.number} wurde aufgenommen und wird bearbeitet.\n\nBetreff: ${ticket.subject}\n\nPHT Service`,
  });

  return NextResponse.json({ ok: true, ticket });
}

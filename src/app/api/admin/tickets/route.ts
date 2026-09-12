import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { sendMail } from "@/lib/mail";

const ALLOWED = [
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
  "closed",
];

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      company: { select: { name: true } },
      requester: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      number: t.number,
      type: t.type,
      subject: t.subject,
      message: t.message,
      status: t.status,
      adminNote: t.adminNote,
      createdAt: t.createdAt.toISOString(),
      company: t.company,
      requester: t.requester,
    })),
  });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: string;
    adminNote?: string;
  } | null;
  if (!body?.id || !body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.supportTicket.findUnique({
    where: { id: body.id },
    include: {
      requester: { select: { email: true, name: true } },
      company: { select: { name: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: body.id },
    data: {
      status: body.status,
      ...(body.adminNote !== undefined ? { adminNote: body.adminNote } : {}),
    },
  });

  if (existing.requester?.email) {
    await sendMail({
      to: existing.requester.email,
      subject: `Ticket ${ticket.number}: Status ${ticket.status}`,
      text: `Guten Tag ${existing.requester.name},\n\nIhr Ticket ${ticket.number} hat den Status „${ticket.status}“.\n${
        ticket.adminNote ? `\nHinweis: ${ticket.adminNote}\n` : ""
      }\nPHT Service`,
    });
  }

  return NextResponse.json({ ok: true, ticket });
}

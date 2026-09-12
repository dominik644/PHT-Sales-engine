import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

const ALLOWED = ["open", "in_progress", "offered", "accepted", "rejected", "expired"];

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { company: { select: { name: true } } },
  });
  return NextResponse.json({
    quotes: quotes.map((q) => ({
      id: q.id,
      number: q.number,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
      note: q.note,
      company: q.company,
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
  } | null;
  if (!body?.id || !body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const quote = await prisma.quoteRequest.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true, quote });
}

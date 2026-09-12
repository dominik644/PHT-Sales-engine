import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

const ALLOWED = ["open", "confirmed", "done", "cancelled"];

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { company: { select: { name: true } } },
  });
  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      number: r.number,
      status: r.status,
      type: r.type,
      createdAt: r.createdAt.toISOString(),
      note: r.note,
      company: r.company,
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
  const row = await prisma.serviceRequest.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true, request: row });
}

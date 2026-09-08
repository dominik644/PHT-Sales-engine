import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, orders: true } } },
  });
  return NextResponse.json({ companies });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    companyId?: string;
    status?: string;
    erpCustomerId?: string;
  } | null;

  if (!body?.companyId || !body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!["pending", "active", "suspended"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: body.companyId },
    data: {
      status: body.status,
      erpCustomerId: body.erpCustomerId ?? undefined,
    },
  });

  return NextResponse.json({ ok: true, company });
}

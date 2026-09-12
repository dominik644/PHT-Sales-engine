import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [companies, priceGroups] = await Promise.all([
    prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true, orders: true } },
        defaultPaymentTerm: true,
        priceGroup: true,
      },
    }),
    prisma.priceGroup.findMany({ orderBy: { code: "asc" } }),
  ]);
  return NextResponse.json({ companies, priceGroups });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    companyId?: string;
    status?: string;
    erpCustomerId?: string | null;
    defaultPaymentTermId?: string | null;
    priceGroupId?: string | null;
    requiresPrepaid?: boolean;
    approvalThresholdCents?: number | null;
  } | null;

  if (!body?.companyId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.status && !["pending", "active", "suspended"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: body.companyId },
    data: {
      status: body.status,
      erpCustomerId:
        body.erpCustomerId === undefined ? undefined : body.erpCustomerId,
      defaultPaymentTermId:
        body.defaultPaymentTermId === undefined
          ? undefined
          : body.defaultPaymentTermId,
      priceGroupId:
        body.priceGroupId === undefined ? undefined : body.priceGroupId,
      requiresPrepaid:
        body.requiresPrepaid === undefined ? undefined : body.requiresPrepaid,
      approvalThresholdCents:
        body.approvalThresholdCents === undefined
          ? undefined
          : body.approvalThresholdCents,
    },
  });

  return NextResponse.json({ ok: true, company });
}

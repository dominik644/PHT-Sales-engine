import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { paymentTermSchema } from "@/lib/validation";

export async function GET() {
  const terms = await prisma.paymentTerm.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ paymentTerms: terms });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = paymentTermSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.depositPercent + input.balancePercent !== 100) {
    return NextResponse.json(
      { error: "depositPercent + balancePercent must equal 100" },
      { status: 400 },
    );
  }

  const term = await prisma.paymentTerm.create({
    data: {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description,
      depositPercent: input.depositPercent,
      balancePercent: input.balancePercent,
      balanceDueDays: input.balanceDueDays,
      active: input.active,
      sortOrder: input.sortOrder,
    },
  });

  return NextResponse.json({ ok: true, paymentTerm: term });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    active?: boolean;
    companyId?: string;
    defaultPaymentTermId?: string | null;
  } | null;

  if (body?.companyId) {
    const company = await prisma.company.update({
      where: { id: body.companyId },
      data: { defaultPaymentTermId: body.defaultPaymentTermId ?? null },
    });
    return NextResponse.json({ ok: true, company });
  }

  if (!body?.id || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const term = await prisma.paymentTerm.update({
    where: { id: body.id },
    data: { active: body.active },
  });
  return NextResponse.json({ ok: true, paymentTerm: term });
}

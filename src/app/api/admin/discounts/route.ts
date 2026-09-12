import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { discountSchema } from "@/lib/validation";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const discounts = await prisma.discount.findMany({
    orderBy: { validTo: "desc" },
    include: { company: true },
  });
  return NextResponse.json({ discounts });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = discountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.type === "percent" && (input.percentOff == null || input.percentOff <= 0)) {
    return NextResponse.json(
      { error: "percentOff required for percent discounts" },
      { status: 400 },
    );
  }
  if (
    input.type === "fixed" &&
    (input.amountOffCents == null || input.amountOffCents <= 0)
  ) {
    return NextResponse.json(
      { error: "amountOffCents required for fixed discounts" },
      { status: 400 },
    );
  }

  const validFrom = new Date(input.validFrom);
  const validTo = new Date(input.validTo);
  if (validTo <= validFrom) {
    return NextResponse.json(
      { error: "validTo must be after validFrom" },
      { status: 400 },
    );
  }

  const discount = await prisma.discount.create({
    data: {
      code: input.code.toUpperCase(),
      name: input.name,
      type: input.type,
      percentOff: input.type === "percent" ? input.percentOff : null,
      amountOffCents: input.type === "fixed" ? input.amountOffCents : null,
      minSubtotalCents: input.minSubtotalCents,
      validFrom,
      validTo,
      companyId: input.companyId || null,
      active: input.active,
    },
  });

  return NextResponse.json({ ok: true, discount });
}

import { prisma } from "@/lib/db";

export type AppliedDiscount = {
  id: string;
  code: string;
  name: string;
  discountCents: number;
};

export async function resolveDiscount(options: {
  code?: string | null;
  companyId: string;
  subtotalCents: number;
  at?: Date;
}): Promise<AppliedDiscount | null> {
  const code = options.code?.trim().toUpperCase();
  if (!code) return null;

  const now = options.at ?? new Date();
  const discount = await prisma.discount.findFirst({
    where: {
      code,
      active: true,
      validFrom: { lte: now },
      validTo: { gte: now },
      OR: [{ companyId: null }, { companyId: options.companyId }],
    },
  });

  if (!discount) return null;
  if (options.subtotalCents < discount.minSubtotalCents) return null;

  let discountCents = 0;
  if (discount.type === "percent" && discount.percentOff != null) {
    discountCents = Math.round(
      (options.subtotalCents * discount.percentOff) / 100,
    );
  } else if (discount.type === "fixed" && discount.amountOffCents != null) {
    discountCents = discount.amountOffCents;
  }

  discountCents = Math.max(0, Math.min(discountCents, options.subtotalCents));
  if (discountCents <= 0) return null;

  return {
    id: discount.id,
    code: discount.code,
    name: discount.name,
    discountCents,
  };
}

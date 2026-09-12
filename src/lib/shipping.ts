import { prisma } from "@/lib/db";

export type ShippingQuote = {
  code: string;
  name: string;
  description: string;
  cents: number;
  allowsPickup: boolean;
};

export async function listShippingOptions(
  subtotalCents: number,
): Promise<ShippingQuote[]> {
  const methods = await prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return methods.map((m) => {
    const free =
      m.allowsPickup ||
      (m.freeAboveCents != null && subtotalCents >= m.freeAboveCents);
    return {
      code: m.code,
      name: m.name,
      description: m.description,
      cents: free ? 0 : m.baseCents,
      allowsPickup: m.allowsPickup,
    };
  });
}

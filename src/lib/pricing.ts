import { prisma } from "@/lib/db";

export type ResolvedPrice = {
  listCents: number;
  unitCents: number;
  tierApplied: boolean;
  groupPercentOff: number;
  minOrderQty: number;
  vatRateBps: number;
};

/**
 * Kundenspezifischer Netto-Preis (Demo bis BC Price Groups live sind).
 * Ohne Firma → Listenpreis (UI soll Preise ohne Login ausblenden).
 */
export async function resolveUnitPrice(options: {
  productId: string;
  quantity: number;
  companyId?: string | null;
}): Promise<ResolvedPrice> {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: options.productId },
    include: {
      priceTiers: { orderBy: { qtyFrom: "desc" } },
    },
  });

  let groupPercentOff = 0;
  if (options.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: options.companyId },
      include: { priceGroup: true },
    });
    groupPercentOff = company?.priceGroup?.percentOff ?? 0;
  }

  let unit = product.priceCents;
  let tierApplied = false;
  const qty = Math.max(1, options.quantity);
  for (const tier of product.priceTiers) {
    if (qty >= tier.qtyFrom) {
      unit = tier.unitCents;
      tierApplied = true;
      break;
    }
  }

  if (groupPercentOff > 0) {
    unit = Math.round(unit * (1 - groupPercentOff / 100));
  }

  return {
    listCents: product.priceCents,
    unitCents: unit,
    tierApplied,
    groupPercentOff,
    minOrderQty: product.minOrderQty,
    vatRateBps: product.vatRateBps,
  };
}

export async function companyRequiresPrepaid(companyId: string): Promise<boolean> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return true;
  if (company.status !== "active") return true;
  return company.requiresPrepaid;
}

/** Listenpreis mit Preisgruppe (ohne Staffel) — für Kachel-/Listenansicht. */
export async function resolveListUnitPrice(options: {
  productId: string;
  listCents: number;
  companyId?: string | null;
}): Promise<number> {
  if (!options.companyId) return options.listCents;
  const company = await prisma.company.findUnique({
    where: { id: options.companyId },
    include: { priceGroup: true },
  });
  const percentOff = company?.priceGroup?.percentOff ?? 0;
  if (percentOff <= 0) return options.listCents;
  return Math.round(options.listCents * (1 - percentOff / 100));
}

export async function applyCompanyListPrices<
  T extends { id: string; priceCents: number },
>(products: T[], companyId?: string | null): Promise<T[]> {
  if (!companyId || products.length === 0) return products;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { priceGroup: true },
  });
  const percentOff = company?.priceGroup?.percentOff ?? 0;
  if (percentOff <= 0) return products;
  return products.map((p) => ({
    ...p,
    priceCents: Math.round(p.priceCents * (1 - percentOff / 100)),
  }));
}

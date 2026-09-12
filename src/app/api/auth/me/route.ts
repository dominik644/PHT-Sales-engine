import { NextResponse } from "next/server";
import {
  createCustomerSession,
  getFreshSessionUser,
  getSessionUser,
  roleLabel,
} from "@/lib/b2b-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const jwtUser = await getSessionUser();
  if (!jwtUser) return NextResponse.json({ user: null });

  const user = await getFreshSessionUser();
  if (!user) return NextResponse.json({ user: null });

  // Cookie aktualisieren, wenn Status/Name nach Freischaltung abweichen
  if (
    user.companyStatus !== jwtUser.companyStatus ||
    user.companyName !== jwtUser.companyName ||
    user.role !== jwtUser.role ||
    user.name !== jwtUser.name
  ) {
    await createCustomerSession(user);
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    include: { defaultPaymentTerm: true, priceGroup: true },
  });

  return NextResponse.json({
    user: {
      ...user,
      roleLabel: roleLabel(user.role),
      role: user.role,
      requiresPrepaid: company?.requiresPrepaid ?? true,
      defaultPaymentTermId: company?.defaultPaymentTermId ?? null,
      defaultPaymentTerm: company?.defaultPaymentTerm
        ? {
            id: company.defaultPaymentTerm.id,
            code: company.defaultPaymentTerm.code,
            name: company.defaultPaymentTerm.name,
          }
        : null,
      priceGroupCode: company?.priceGroup?.code ?? null,
      approvalThresholdCents: company?.approvalThresholdCents ?? null,
    },
  });
}

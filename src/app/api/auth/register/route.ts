import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerCompanySchema } from "@/lib/validation";
import {
  createCustomerSession,
  hashPassword,
  type UserRole,
} from "@/lib/b2b-auth";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = await enforceRateLimit(`register:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const email = input.adminEmail.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "E-Mail ist bereits registriert" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(input.password);
  const company = await prisma.company.create({
    data: {
      name: input.companyName,
      vatId: input.vatId || null,
      billingEmail: input.billingEmail.toLowerCase(),
      addressLine1: input.address,
      city: input.city,
      postalCode: input.postal,
      country: input.country,
      status: "pending",
      users: {
        create: {
          email,
          name: input.adminName,
          passwordHash,
          role: input.role as UserRole,
        },
      },
    },
    include: { users: true },
  });

  const user = company.users[0];
  await createCustomerSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    companyId: company.id,
    companyName: company.name,
    companyStatus: company.status,
  });

  return NextResponse.json({
    ok: true,
    company: {
      id: company.id,
      name: company.name,
      status: company.status,
    },
    message:
      "Registrierung erfolgreich. PHT muss die Firma freischalten, bevor Bestellungen möglich sind.",
  });
}

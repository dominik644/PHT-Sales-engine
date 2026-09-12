import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import {
  createCustomerSession,
  destroyCustomerSession,
  verifyPassword,
  type UserRole,
} from "@/lib/b2b-auth";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = await enforceRateLimit(`login:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { company: true },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
  }

  await createCustomerSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    companyId: user.companyId,
    companyName: user.company.name,
    companyStatus: user.company.status,
  });

  return NextResponse.json({
    ok: true,
    user: {
      name: user.name,
      role: user.role,
      companyStatus: user.company.status,
    },
  });
}

export async function DELETE() {
  await destroyCustomerSession();
  return NextResponse.json({ ok: true });
}

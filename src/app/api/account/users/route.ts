import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  requireActiveB2BUser,
  ROLES,
} from "@/lib/b2b-auth";
import { inviteUserSchema } from "@/lib/validation";

export async function GET() {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.COMPANY_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  let session;
  try {
    session = await requireActiveB2BUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.COMPANY_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = inviteUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: {
      companyId: session.companyId,
      email,
      name: input.name,
      role: input.role,
      passwordHash: await hashPassword(input.password),
      active: true,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json({ ok: true, user });
}

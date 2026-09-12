import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export { roleLabel } from "@/lib/role-labels";

const CUSTOMER_COOKIE = "pht_b2b_session";

export const ROLES = {
  PRODUCTION_MANAGER: "PRODUCTION_MANAGER",
  PURCHASING: "PURCHASING",
  COMPANY_ADMIN: "COMPANY_ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  companyStatus: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createCustomerSession(user: SessionUser) {
  const token = await new SignJWT({
    typ: "b2b",
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSessionSecret());

  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroyCustomerSession() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (payload.typ !== "b2b" || typeof payload.sub !== "string") return null;
    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as UserRole,
      companyId: String(payload.companyId),
      companyName: String(payload.companyName),
      companyStatus: String(payload.companyStatus),
    };
  } catch {
    return null;
  }
}

/**
 * Session + live Firma/Nutzer-Status aus der DB (JWT-Status kann veraltet sein
 * nach Admin-Freischaltung).
 */
export async function getFreshSessionUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true },
  });
  if (!dbUser?.active) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as UserRole,
    companyId: dbUser.companyId,
    companyName: dbUser.company.name,
    companyStatus: dbUser.company.status,
  };
}

export async function requireActiveB2BUser(): Promise<SessionUser> {
  const user = await getFreshSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.companyStatus !== "active") throw new Error("COMPANY_INACTIVE");
  return user;
}

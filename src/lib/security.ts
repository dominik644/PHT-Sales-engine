import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getDemoMode } from "@/lib/env";

const SESSION_COOKIE = "pht_admin_session";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !password) return false;
  const a = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const b = Buffer.from(createHash("sha256").update(expected).digest("hex"));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSessionSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !getDemoMode(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function requireAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET ?? "";
  if (!secret || !signatureHeader) return false;
  const expected = createHash("sha256")
    .update(`${secret}.${rawBody}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Simple DB-backed rate limit: max `limit` requests per `windowMs` per key. */
export async function enforceRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { id: key } });

  if (!bucket || now.getTime() - bucket.windowStart.getTime() > windowMs) {
    await prisma.rateLimitBucket.upsert({
      where: { id: key },
      create: { id: key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    const retryAfterSec = Math.ceil(
      (windowMs - (now.getTime() - bucket.windowStart.getTime())) / 1000,
    );
    return { ok: false, retryAfterSec };
  }

  await prisma.rateLimitBucket.update({
    where: { id: key },
    data: { count: { increment: 1 } },
  });
  return { ok: true };
}

export { formatMoney } from "@/lib/money";
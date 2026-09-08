import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/security";

/**
 * ERP → Shop stock webhook.
 * Body: { sku: string, stock: number }
 * Header: x-pht-signature = sha256(secret + "." + rawBody)
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-pht-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { sku?: string; stock?: number };
  try {
    payload = JSON.parse(raw) as { sku?: string; stock?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.sku || typeof payload.stock !== "number" || payload.stock < 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.product.updateMany({
    where: { sku: payload.sku },
    data: { stock: Math.floor(payload.stock) },
  });

  await prisma.erpSyncLog.create({
    data: {
      direction: "inbound",
      entity: "stock",
      status: updated.count ? "ok" : "miss",
      detail: `${payload.sku}=${payload.stock} (sig ${createHash("sha256").update(raw).digest("hex").slice(0, 8)})`,
    },
  });

  if (!updated.count) {
    return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

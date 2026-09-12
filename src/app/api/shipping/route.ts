import { NextResponse } from "next/server";
import { listShippingOptions } from "@/lib/shipping";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subtotal = Number(url.searchParams.get("subtotal") ?? "0");
  const options = await listShippingOptions(
    Number.isFinite(subtotal) ? Math.max(0, Math.floor(subtotal)) : 0,
  );
  return NextResponse.json({ shippingMethods: options });
}

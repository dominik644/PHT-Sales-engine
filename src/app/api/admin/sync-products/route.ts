import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { syncProductsFromErp } from "@/lib/erp/sync";

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncProductsFromErp();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

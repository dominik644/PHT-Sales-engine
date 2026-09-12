import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { pushOrderAndInvoiceToErp } from "@/lib/erp/sync";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const result = await pushOrderAndInvoiceToErp(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ERP push failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

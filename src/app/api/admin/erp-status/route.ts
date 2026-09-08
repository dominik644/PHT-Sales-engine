import { NextResponse } from "next/server";
import { getErpAdapter, getBusinessCentralStatus } from "@/lib/erp";
import { requireAdmin } from "@/lib/security";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = (process.env.ERP_PROVIDER ?? "mock").toLowerCase();
  const adapter = getErpAdapter();

  let health = { ok: true, detail: `Provider ${adapter.name}` };
  if (adapter.healthCheck) {
    health = await adapter.healthCheck();
  } else if (adapter.name === "mock") {
    const products = await adapter.fetchProducts();
    health = {
      ok: true,
      detail: `Mock ERP ready (${products.length} products)`,
    };
  }

  return NextResponse.json({
    provider,
    adapter: adapter.name,
    health,
    businessCentral: getBusinessCentralStatus(),
    rest: {
      baseUrlConfigured: Boolean(process.env.ERP_BASE_URL),
      apiKeyConfigured: Boolean(process.env.ERP_API_KEY),
    },
  });
}

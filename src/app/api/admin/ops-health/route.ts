import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { assertProductionEnv, getDemoMode } from "@/lib/env";
import { getErpAdapter } from "@/lib/erp";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = assertProductionEnv();
  const adapter = getErpAdapter();

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  let erpHealth = { ok: false, detail: "n/a" };
  try {
    if (adapter.healthCheck) {
      erpHealth = await adapter.healthCheck();
    } else {
      erpHealth = {
        ok: true,
        detail: `Provider ${adapter.name} (no healthCheck)`,
      };
    }
  } catch (error) {
    erpHealth = {
      ok: false,
      detail: error instanceof Error ? error.message : "ERP health failed",
    };
  }

  const [openOrders, failedErp, pendingCompanies, openQuotes, openServices] =
    await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: [
              "awaiting_production_approval",
              "awaiting_purchasing_approval",
            ],
          },
        },
      }),
      prisma.order.count({
        where: {
          AND: [
            { status: { in: ["approved", "confirmed"] } },
            { erpSyncStatus: { not: "synced" } },
          ],
        },
      }),
      prisma.company.count({ where: { status: "pending" } }),
      prisma.quoteRequest.count({ where: { status: "open" } }),
      prisma.serviceRequest.count({ where: { status: "open" } }),
    ]);

  return NextResponse.json({
    ok: dbOk && erpHealth.ok && (env.mode !== "production" || env.ok),
    demoMode: getDemoMode(),
    database: dbOk ? "ok" : "fail",
    erp: {
      provider: adapter.name,
      ok: erpHealth.ok,
      detail: erpHealth.detail,
    },
    env: {
      ok: env.ok,
      mode: env.mode,
      errors: env.errors,
      warnings: env.warnings,
    },
    queues: {
      openApprovals: openOrders,
      failedOrPendingErp: failedErp,
      pendingCompanies,
      openQuotes,
      openServices,
    },
    ts: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProductionEnv, getDemoMode } from "@/lib/env";

/** Readiness — DB reachable + env not critically broken. */
export async function GET() {
  const started = Date.now();
  let dbOk = false;
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message : "db_error";
  }

  const env = assertProductionEnv();
  const ready = dbOk && (env.mode !== "production" || env.ok);

  return NextResponse.json(
    {
      ok: ready,
      status: ready ? "ready" : "degraded",
      checks: {
        database: dbOk ? "ok" : "fail",
        env: env.ok ? "ok" : "fail",
      },
      demoMode: getDemoMode(),
      erpProvider: process.env.ERP_PROVIDER ?? "mock",
      latencyMs: Date.now() - started,
      ts: new Date().toISOString(),
      ...(dbError && process.env.NODE_ENV !== "production"
        ? { dbError }
        : {}),
      ...(env.mode === "production" && !env.ok
        ? { envErrors: env.errors }
        : {}),
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

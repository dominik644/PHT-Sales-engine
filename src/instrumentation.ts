export async function register() {
  // Only validate on the Node.js runtime (not Edge).
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { validateEnvOrThrow } = await import("@/lib/env");
  const { logger } = await import("@/lib/logger");
  try {
    const report = validateEnvOrThrow();
    logger.info("boot_ok", {
      mode: report.mode,
      demoMode: report.demoMode,
      erpProvider: process.env.ERP_PROVIDER ?? "mock",
    });
  } catch (error) {
    logger.error("boot_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

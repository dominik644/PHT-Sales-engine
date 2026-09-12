/**
 * Runtime environment validation for production hardening.
 * - Demo deployments (DEMO_MODE=true): warn loudly, still boot
 * - Go-live (DEMO_MODE=false + NODE_ENV=production): hard-fail on unsafe config
 */

const WEAK_SECRETS = [
  "replace-with-long-random-secret-32chars",
  "change-me-pht-admin",
  "changeme",
  "password",
  "secret",
  "test",
];

export type EnvReport = {
  ok: boolean;
  mode: "development" | "production" | "test";
  demoMode: boolean;
  errors: string[];
  warnings: string[];
};

function isWeak(value: string | undefined): boolean {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  if (v.length < 32 && !v.startsWith("file:")) return true;
  return WEAK_SECRETS.some((w) => v.includes(w));
}

function pushIssue(
  demoMode: boolean,
  production: boolean,
  errors: string[],
  warnings: string[],
  message: string,
  hardInDemo = false,
) {
  // Go-live: hard error. Demo/dev: warning unless hardInDemo.
  if (production && !demoMode) {
    errors.push(message);
  } else if (production && demoMode && hardInDemo) {
    errors.push(message);
  } else {
    warnings.push(message);
  }
}

export function getDemoMode(): boolean {
  return (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
}

export function assertProductionEnv(): EnvReport {
  const mode =
    process.env.NODE_ENV === "production"
      ? "production"
      : process.env.NODE_ENV === "test"
        ? "test"
        : "development";
  const demoMode = getDemoMode();
  const production = mode === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.DATABASE_URL) {
    // DB is always required to serve traffic
    errors.push("DATABASE_URL is missing");
  }

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    pushIssue(
      demoMode,
      production,
      errors,
      warnings,
      "SESSION_SECRET must be at least 32 characters",
    );
  } else if (isWeak(process.env.SESSION_SECRET)) {
    pushIssue(
      demoMode,
      production,
      errors,
      warnings,
      "SESSION_SECRET looks like a placeholder — rotate before go-live",
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    pushIssue(
      demoMode,
      production,
      errors,
      warnings,
      "ADMIN_PASSWORD is missing",
    );
  } else if (
    isWeak(process.env.ADMIN_PASSWORD) ||
    process.env.ADMIN_PASSWORD.length < 12
  ) {
    pushIssue(
      demoMode,
      production,
      errors,
      warnings,
      "ADMIN_PASSWORD is weak — use a long random value in production",
    );
  }

  if (production && demoMode) {
    warnings.push(
      "DEMO_MODE=true in production build — set DEMO_MODE=false for go-live hardening",
    );
  }

  if (production && !demoMode) {
    const provider = (process.env.ERP_PROVIDER ?? "mock").toLowerCase();
    if (provider === "mock") {
      warnings.push(
        "ERP_PROVIDER=mock in production — orders will not reach Business Central",
      );
    }
    if (
      (provider === "business-central" || provider === "bc") &&
      !(
        process.env.ERP_WEBHOOK_SECRET &&
        process.env.ERP_WEBHOOK_SECRET.length >= 16
      )
    ) {
      warnings.push("ERP_WEBHOOK_SECRET should be set for BC stock webhooks");
    }
  }

  return { ok: errors.length === 0, mode, demoMode, errors, warnings };
}

/**
 * Boot hook. Throws only for go-live configs (production + DEMO_MODE=false).
 * Demo deployments keep booting with warnings so Vercel previews stay usable.
 */
export function validateEnvOrThrow(): EnvReport {
  const report = assertProductionEnv();
  for (const w of report.warnings) {
    console.warn(`[env] ${w}`);
  }
  if (!report.ok) {
    for (const e of report.errors) {
      console.error(`[env] ${e}`);
    }
    const goLive = report.mode === "production" && !report.demoMode;
    if (goLive) {
      throw new Error(
        `Unsafe production configuration:\n- ${report.errors.join("\n- ")}`,
      );
    }
  }
  return report;
}

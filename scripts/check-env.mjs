#!/usr/bin/env node
/**
 * Validate environment.
 * - Default: report only (exit 1 if DATABASE_URL missing)
 * - STRICT=1 or DEMO_MODE=false: exit 1 on any go-live error
 */
import { config } from "dotenv";

config({ path: ".env" });

const WEAK = [
  "replace-with-long-random-secret-32chars",
  "change-me-pht-admin",
  "changeme",
  "password",
  "secret",
  "test",
];

function isWeak(value) {
  if (!value) return true;
  const v = String(value).trim().toLowerCase();
  if (v.length < 32 && !v.startsWith("file:")) return true;
  return WEAK.some((w) => v.includes(w));
}

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const demoMode = (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
const strict =
  process.env.STRICT === "1" ||
  process.env.STRICT === "true" ||
  (mode === "production" && !demoMode);

const errors = [];
const warnings = [];

if (!process.env.DATABASE_URL) errors.push("DATABASE_URL missing");

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  (strict ? errors : warnings).push("SESSION_SECRET must be >= 32 chars");
} else if (isWeak(process.env.SESSION_SECRET)) {
  (strict ? errors : warnings).push("SESSION_SECRET looks weak");
}

if (!process.env.ADMIN_PASSWORD) {
  (strict ? errors : warnings).push("ADMIN_PASSWORD missing");
} else if (
  isWeak(process.env.ADMIN_PASSWORD) ||
  process.env.ADMIN_PASSWORD.length < 12
) {
  (strict ? errors : warnings).push("ADMIN_PASSWORD looks weak");
}

if (mode === "production" && demoMode) {
  warnings.push("DEMO_MODE=true — set false for go-live");
}

const report = {
  ok: errors.length === 0,
  strict,
  mode,
  demoMode,
  erpProvider: process.env.ERP_PROVIDER ?? "mock",
  errors,
  warnings,
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

#!/usr/bin/env node
/**
 * Smoke-check health/ready endpoints.
 * Usage: BASE_URL=http://127.0.0.1:3000 node scripts/ops-smoke.mjs
 */
const base = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function hit(path) {
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { path, status: res.status, ok: res.ok, json };
}

const results = [];
for (const path of ["/api/health", "/api/ready"]) {
  try {
    results.push(await hit(path));
  } catch (error) {
    results.push({
      path,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ base, results, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

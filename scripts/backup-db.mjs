#!/usr/bin/env node
/**
 * SQLite backup helper for demo/staging.
 * Usage: npm run ops:backup
 * Env: DATABASE_URL=file:./dev.db  BACKUP_DIR=./backups
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { config } from "dotenv";

config({ path: ".env" });

const url = process.env.DATABASE_URL ?? "file:./dev.db";
if (!url.startsWith("file:")) {
  console.error(
    "backup-db: only SQLite file: URLs are supported here. For Postgres use pg_dump.",
  );
  process.exit(1);
}

const relative = url.replace(/^file:/, "").replace(/^\.\//, "");
const candidates = [
  resolve(relative),
  resolve("prisma", relative),
  resolve("dev.db"),
  resolve("prisma/dev.db"),
  resolve("data/demo.db"),
];
const dbPath = candidates.find((p) => existsSync(p));
if (!dbPath) {
  console.error(`backup-db: database not found. Tried: ${candidates.join(", ")}`);
  process.exit(1);
}

const backupDir = resolve(process.env.BACKUP_DIR ?? "./backups");
mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = join(backupDir, `pht-webshop-${stamp}.db`);
copyFileSync(dbPath, target);

console.log(
  JSON.stringify({
    ok: true,
    source: dbPath,
    backup: target,
    bytes: statSync(target).size,
    ts: new Date().toISOString(),
  }),
);

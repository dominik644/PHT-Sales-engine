import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  demoDbReady?: boolean;
};

/**
 * On Vercel (and similar serverless hosts) the filesystem is read-only except
 * /tmp. Ship a seeded SQLite file under data/demo.db and copy it into /tmp on
 * first use so the DEMO shop works without an external database.
 */
function ensureDemoSqlite() {
  if (globalForPrisma.demoDbReady) return;

  const url = process.env.DATABASE_URL ?? "";
  const isFileUrl = url.startsWith("file:");
  const isServerless =
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;

  if (!isFileUrl || !isServerless) {
    globalForPrisma.demoDbReady = true;
    return;
  }

  const targetPath = url.replace(/^file:/, "");
  if (!existsSync(targetPath)) {
    mkdirSync(dirname(targetPath), { recursive: true });
    const candidates = [
      join(process.cwd(), "data", "demo.db"),
      join(__dirname, "..", "..", "data", "demo.db"),
      "/var/task/data/demo.db",
    ];
    const seedPath = candidates.find((p) => existsSync(p));
    if (!seedPath) {
      throw new Error(
        `Demo DB missing. Looked in: ${candidates.join(", ")}. Run npm run db:seed and commit data/demo.db.`,
      );
    }
    copyFileSync(seedPath, targetPath);
  }

  globalForPrisma.demoDbReady = true;
}

ensureDemoSqlite();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

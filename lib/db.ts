import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel the bundled SQLite file is read-only; copy it to /tmp on cold start
// so case creation during the demo still works.
function resolveDatabaseUrl(): string | undefined {
  if (!process.env.VERCEL) return undefined;
  try {
    const src = path.join(process.cwd(), "prisma", "swasthya.db");
    const dest = "/tmp/swasthya.db";
    if (!fs.existsSync(dest) && fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
    return `file:${dest}`;
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolveDatabaseUrl()
      ? { db: { url: resolveDatabaseUrl() } }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getDb() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

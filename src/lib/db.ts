import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { getServerEnv } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getDb() {
  const { DATABASE_URL } = getServerEnv();

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

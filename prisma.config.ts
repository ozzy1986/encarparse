import "dotenv/config";

import { defineConfig, env } from "prisma/config";

const defaultDatabaseUrl = "file:./prisma/encar.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ? env("DATABASE_URL") : defaultDatabaseUrl,
  },
});

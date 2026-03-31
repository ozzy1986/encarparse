import "dotenv/config";

import { defineConfig, env } from "prisma/config";

const placeholderUrl = "postgresql://encarparse:encarparse@127.0.0.1:5432/encarparse";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ? env("DATABASE_URL") : placeholderUrl,
  },
});

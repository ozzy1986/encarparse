import { z } from "zod";

export const DEFAULT_DATABASE_URL = "file:./prisma/encar.db";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SCRAPE_MAX_PAGES_PER_CATEGORY: z.coerce.number().int().positive().optional(),
  SCRAPE_PAGE_LIMIT: z.coerce.number().int().positive().optional(),
  SCRAPE_REQUEST_DELAY_MS: z.coerce.number().int().nonnegative().optional(),
  SCRAPE_HEADLESS: z.enum(["true", "false"]).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv() {
  if (!cachedEnv) {
    cachedEnv = serverEnvSchema.parse(process.env);
  }

  return cachedEnv;
}

export function getDatabaseUrl() {
  return getServerEnv().DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

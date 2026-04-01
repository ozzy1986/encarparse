import "dotenv/config";

import { syncEncarListings } from "../src/lib/encar/sync";
import { createScrapeLogger } from "../src/lib/logger";
import type { EncarCategoryId } from "../src/lib/encar/types";

function parseListArg(flag: string) {
  const argument = process.argv.find((item) => item.startsWith(`${flag}=`));
  if (!argument) {
    return undefined;
  }

  return argument
    .slice(flag.length + 1)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberArg(flag: string) {
  const argument = process.argv.find((item) => item.startsWith(`${flag}=`));
  if (!argument) {
    return undefined;
  }

  const parsed = Number(argument.slice(flag.length + 1));
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function main() {
  const logger = createScrapeLogger("scrape");
  const categories = parseListArg("--categories") as EncarCategoryId[] | undefined;
  const debug = process.argv.includes("--debug");
  const maxPagesPerCategory = parseNumberArg("--max-pages");
  const limitPerPage = parseNumberArg("--limit");
  const fullRefresh = process.argv.includes("--full-refresh") || process.env.SCRAPE_FULL_REFRESH === "true";

  try {
    const summary = await syncEncarListings({
      categories,
      debug,
      maxPagesPerCategory,
      limitPerPage,
      fullRefresh,
      logger,
    });

    logger.info("ENCAR sync completed: " + JSON.stringify(summary));
  } finally {
    logger.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});

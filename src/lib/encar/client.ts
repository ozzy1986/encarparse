import type { Logger } from "../logger";
import { delay } from "../utils";

import { normalizeApiRecord } from "./parser";
import {
  ENCAR_CATEGORIES,
  type EncarCategoryId,
  ENCAR_API_BASE_URL,
  type EncarApiResponse,
  type EncarNormalizedListing,
} from "./types";

export interface EncarScrapeOptions {
  categories?: EncarCategoryId[];
  limitPerPage?: number;
  maxPagesPerCategory?: number;
  requestDelayMs?: number;
  debug?: boolean;
  fullRefresh?: boolean;
  logger?: Logger;
}

interface ResolvedOptions {
  limitPerPage: number;
  maxPagesPerCategory: number;
  requestDelayMs: number;
  debug: boolean;
}

function resolveOptions(options: EncarScrapeOptions): ResolvedOptions {
  return {
    limitPerPage: options.limitPerPage ?? Number(process.env.SCRAPE_PAGE_LIMIT ?? 100),
    maxPagesPerCategory: options.maxPagesPerCategory ?? Number(process.env.SCRAPE_MAX_PAGES_PER_CATEGORY ?? 10_000),
    requestDelayMs: options.requestDelayMs ?? Number(process.env.SCRAPE_REQUEST_DELAY_MS ?? 450),
    debug: options.debug ?? false,
  };
}

function selectedCategories(categoryIds?: EncarCategoryId[]) {
  if (!categoryIds || categoryIds.length === 0) {
    return ENCAR_CATEGORIES;
  }

  return ENCAR_CATEGORIES.filter((category) => categoryIds.includes(category.id));
}

function dedupeListings(listings: EncarNormalizedListing[]) {
  const seen = new Set<string>();
  const unique: EncarNormalizedListing[] = [];
  for (const listing of listings) {
    if (seen.has(listing.sourceId)) {
      continue;
    }
    seen.add(listing.sourceId);
    unique.push(listing);
  }
  return unique;
}

function srParam(offset: number, limit: number) {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.floor(limit));
  return `|ModifiedDate|${safeOffset}|${safeLimit}`;
}

async function fetchCategoryPage(categoryId: EncarCategoryId, offset: number, limit: number): Promise<EncarApiResponse> {
  const category = ENCAR_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    throw new Error(`Unknown ENCAR category: ${categoryId}`);
  }

  const url = new URL("/search/car/list/general", ENCAR_API_BASE_URL);
  url.searchParams.set("count", "true");
  url.searchParams.set("q", category.apiQuery);
  url.searchParams.set("sr", srParam(offset, limit));

  const response = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "user-agent":
        process.env.SCRAPE_USER_AGENT ??
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`[encar] api error ${response.status} ${url.toString()} ${text.slice(0, 200)}`);
  }

  return (await response.json()) as EncarApiResponse;
}

export interface EncarCategoryPage {
  categoryId: EncarCategoryId;
  pageIndex: number;
  offset: number;
  limit: number;
  totalCount: number;
  listings: EncarNormalizedListing[];
}

export async function* scrapeEncarCategoryPages(options: EncarScrapeOptions = {}): AsyncGenerator<EncarCategoryPage> {
  const resolved = resolveOptions(options);
  const categories = selectedCategories(options.categories);
  const log = options.logger;

  for (const category of categories) {
    let offset = 0;
    let pageIndex = 0;
    let totalCount = Number.POSITIVE_INFINITY;

    log?.info(`[encar] starting category=${category.id} limit=${resolved.limitPerPage} maxPages=${resolved.maxPagesPerCategory}`);

    while (offset < totalCount && pageIndex < resolved.maxPagesPerCategory) {
      const payload = await fetchCategoryPage(category.id, offset, resolved.limitPerPage);
      const records = Array.isArray(payload.SearchResults) ? payload.SearchResults : [];
      const nextTotal = typeof payload.Count === "number" && Number.isFinite(payload.Count) ? payload.Count : totalCount;
      totalCount = nextTotal;

      const listings = records
        .map((record) => normalizeApiRecord(record, category.id))
        .filter((item): item is EncarNormalizedListing => Boolean(item));
      const uniqueListings = dedupeListings(listings);

      log?.info(
        `[encar] ${category.id} page=${pageIndex} offset=${offset} got=${records.length} parsed=${listings.length} unique=${uniqueListings.length} total=${totalCount}`,
      );

      yield {
        categoryId: category.id,
        pageIndex,
        offset,
        limit: resolved.limitPerPage,
        totalCount: Number.isFinite(totalCount) ? totalCount : 0,
        listings: uniqueListings,
      };

      const advance = records.length > 0 ? records.length : resolved.limitPerPage;
      offset += advance;
      pageIndex += 1;

      if (records.length === 0) {
        break;
      }

      await delay(resolved.requestDelayMs);
    }

    log?.info(`[encar] finished category=${category.id} pages=${pageIndex} discovered=${offset}`);
  }
}

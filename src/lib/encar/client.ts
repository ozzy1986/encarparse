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

const API_OFFSET_CAP = 9_800;
const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_YEAR = 1990;

function resolveOptions(options: EncarScrapeOptions): ResolvedOptions {
  return {
    limitPerPage: options.limitPerPage ?? Number(process.env.SCRAPE_PAGE_LIMIT ?? 200),
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

function withYearRange(baseQuery: string, rangeFrom: number, rangeTo: number) {
  const carTypeMatch = baseQuery.match(/CarType\.\w+\./);
  if (!carTypeMatch) {
    throw new Error(`Cannot append year filter: no CarType found in query "${baseQuery}"`);
  }
  const carTypePart = carTypeMatch[0];
  return baseQuery.replace(
    carTypePart,
    `(C.${carTypePart}_.Year.range(${rangeFrom}..${rangeTo}).)`,
  );
}

async function fetchPage(query: string, offset: number, limit: number): Promise<EncarApiResponse> {
  const url = new URL("/search/car/list/general", ENCAR_API_BASE_URL);
  url.searchParams.set("count", "true");
  url.searchParams.set("q", query);
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

async function probeCount(query: string): Promise<number> {
  const url = new URL("/search/car/list/general", ENCAR_API_BASE_URL);
  url.searchParams.set("count", "true");
  url.searchParams.set("q", query);
  url.searchParams.set("sr", srParam(0, 0));

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
    return 0;
  }

  const data = (await response.json()) as EncarApiResponse;
  return typeof data.Count === "number" ? data.Count : 0;
}

interface YearWindow {
  yearFrom: number;
  yearTo: number;
  query: string;
  expectedCount: number;
}

async function splitAndPush(
  windows: YearWindow[],
  baseQuery: string,
  ranges: Array<[number, number]>,
  year: number,
  log?: Logger,
  delayMs?: number,
): Promise<void> {
  for (const [from, to] of ranges) {
    const q = withYearRange(baseQuery, from, to);
    const c = await probeCount(q);
    if (delayMs) await delay(delayMs / 3);
    log?.info(`[encar] year=${year} range=[${from}..${to}) count=${c}`);
    if (c > 0) {
      windows.push({ yearFrom: year, yearTo: year + 1, query: q, expectedCount: c });
    }
  }
}

async function buildYearWindows(
  baseQuery: string,
  log?: Logger,
  delayMs?: number,
): Promise<YearWindow[]> {
  const windows: YearWindow[] = [];

  for (let year = CURRENT_YEAR; year >= OLDEST_YEAR; year--) {
    const query = withYearRange(baseQuery, year * 100, (year + 1) * 100);
    const count = await probeCount(query);
    if (delayMs) await delay(delayMs / 3);

    if (count === 0) {
      continue;
    }

    if (count <= API_OFFSET_CAP) {
      windows.push({ yearFrom: year, yearTo: year + 1, query, expectedCount: count });
      log?.info(`[encar] year=${year} count=${count}`);
    } else {
      log?.info(`[encar] year=${year} count=${count} (exceeds cap, splitting into halves)`);
      const h1From = year * 100;
      const h1To = year * 100 + 7;
      const h2From = year * 100 + 7;
      const h2To = (year + 1) * 100;

      const h1q = withYearRange(baseQuery, h1From, h1To);
      const h2q = withYearRange(baseQuery, h2From, h2To);
      const h1Count = await probeCount(h1q);
      if (delayMs) await delay(delayMs / 3);
      const h2Count = await probeCount(h2q);
      if (delayMs) await delay(delayMs / 3);

      log?.info(`[encar] year=${year} H1=[${h1From}..${h1To})=${h1Count} H2=[${h2From}..${h2To})=${h2Count}`);

      if (h1Count > 0 && h1Count <= API_OFFSET_CAP) {
        windows.push({ yearFrom: year, yearTo: year + 1, query: h1q, expectedCount: h1Count });
      } else if (h1Count > API_OFFSET_CAP) {
        await splitAndPush(windows, baseQuery, [
          [year * 100, year * 100 + 4],
          [year * 100 + 4, year * 100 + 7],
        ], year, log, delayMs);
      }

      if (h2Count > 0 && h2Count <= API_OFFSET_CAP) {
        windows.push({ yearFrom: year, yearTo: year + 1, query: h2q, expectedCount: h2Count });
      } else if (h2Count > API_OFFSET_CAP) {
        await splitAndPush(windows, baseQuery, [
          [year * 100 + 7, year * 100 + 10],
          [year * 100 + 10, (year + 1) * 100],
        ], year, log, delayMs);
      }
    }
  }

  return windows;
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
  let globalPageIndex = 0;

  for (const category of categories) {
    log?.info(`[encar] category=${category.id}: probing year windows...`);
    const baseQuery = category.apiQuery;

    const windows = await buildYearWindows(baseQuery, log, resolved.requestDelayMs);
    const totalExpected = windows.reduce((sum, w) => sum + w.expectedCount, 0);
    log?.info(`[encar] category=${category.id}: ${windows.length} windows, ~${totalExpected} expected records`);

    for (const window of windows) {
      let offset = 0;
      let pageIndex = 0;
      let totalCount = window.expectedCount;

      while (offset < totalCount && offset < API_OFFSET_CAP && pageIndex < resolved.maxPagesPerCategory) {
        const payload = await fetchPage(window.query, offset, resolved.limitPerPage);
        const records = Array.isArray(payload.SearchResults) ? payload.SearchResults : [];
        const nextTotal = typeof payload.Count === "number" && Number.isFinite(payload.Count) ? payload.Count : totalCount;
        totalCount = nextTotal;

        const listings = records
          .map((record) => normalizeApiRecord(record, category.id))
          .filter((item): item is EncarNormalizedListing => Boolean(item));
        const uniqueListings = dedupeListings(listings);

        log?.info(
          `[encar] ${category.id} window=[${window.yearFrom}-${window.yearTo}) page=${pageIndex} offset=${offset} got=${records.length} parsed=${listings.length} unique=${uniqueListings.length} windowTotal=${totalCount}`,
        );

        yield {
          categoryId: category.id,
          pageIndex: globalPageIndex,
          offset,
          limit: resolved.limitPerPage,
          totalCount: Number.isFinite(totalCount) ? totalCount : 0,
          listings: uniqueListings,
        };

        globalPageIndex += 1;
        const advance = records.length > 0 ? records.length : resolved.limitPerPage;
        offset += advance;
        pageIndex += 1;

        if (records.length === 0) {
          break;
        }

        await delay(resolved.requestDelayMs);
      }
    }

    log?.info(`[encar] category=${category.id} finished`);
  }
}

import { existsSync } from "node:fs";

import { chromium, type BrowserContext, type LaunchOptions, type Page, type Response } from "playwright";

import { delay } from "../utils";

import { extractListingsFromPayload, normalizeDomCandidate } from "./parser";
import {
  ENCAR_CATEGORIES,
  type EncarCategory,
  type EncarCategoryId,
  type EncarCategoryScrapeResult,
  type EncarNormalizedListing,
  type EncarScrapeResult,
} from "./types";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const RESPONSE_HINT = /(search|list|result|api|ajax|select|vehicle|car)/i;

export interface EncarScrapeOptions {
  categories?: EncarCategoryId[];
  headless?: boolean;
  limitPerPage?: number;
  maxPagesPerCategory?: number;
  requestDelayMs?: number;
  debug?: boolean;
}

interface ResolvedOptions {
  headless: boolean;
  limitPerPage: number;
  maxPagesPerCategory: number;
  requestDelayMs: number;
  debug: boolean;
}

function resolveOptions(options: EncarScrapeOptions): ResolvedOptions {
  return {
    headless: options.headless ?? process.env.SCRAPE_HEADLESS !== "false",
    limitPerPage: options.limitPerPage ?? Number(process.env.SCRAPE_PAGE_LIMIT ?? 60),
    maxPagesPerCategory: options.maxPagesPerCategory ?? Number(process.env.SCRAPE_MAX_PAGES_PER_CATEGORY ?? 30),
    requestDelayMs: options.requestDelayMs ?? Number(process.env.SCRAPE_REQUEST_DELAY_MS ?? 1200),
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

function resolveLaunchOptions(headless: boolean): LaunchOptions {
  const configuredExecutable = process.env.PLAYWRIGHT_EXECUTABLE_PATH?.trim();
  const knownWindowsEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const executablePath = [configuredExecutable, process.platform === "win32" ? knownWindowsEdgePath : undefined]
    .filter((candidate): candidate is string => Boolean(candidate))
    .find((candidate) => existsSync(candidate));

  return {
    headless,
    args: ["--disable-dev-shm-usage"],
    ...(executablePath ? { executablePath } : {}),
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  };
}

async function maybeExtractFromResponse(response: Response, categoryId: EncarCategoryId) {
  const contentType = response.headers()["content-type"] ?? "";
  if (!response.ok() || (!contentType.includes("json") && !RESPONSE_HINT.test(response.url()))) {
    return [];
  }

  try {
    const payload = contentType.includes("json") ? await response.json() : JSON.parse(await response.text());
    return extractListingsFromPayload(payload, categoryId);
  } catch {
    return [];
  }
}

async function applyHashState(page: Page, category: EncarCategory, pageNumber: number, limitPerPage: number) {
  await page.evaluate(
    ({ defaultAction, nextPage, nextLimit }) => {
      let currentHashbang: Record<string, unknown> = {};
      if (window.location.hash.startsWith("#!")) {
        try {
          currentHashbang = JSON.parse(decodeURIComponent(window.location.hash.slice(2)));
        } catch {
          currentHashbang = {};
        }
      }

      const nextHashbang: Record<string, unknown> = {
        ...currentHashbang,
        page: nextPage,
        limit: nextLimit,
        sort: currentHashbang.sort ?? "ModifiedDate",
      };

      if (defaultAction) {
        nextHashbang.action = defaultAction;
      }

      delete nextHashbang.cursor;
      window.location.hash = `#!${encodeURIComponent(JSON.stringify(nextHashbang))}`;
    },
    { defaultAction: "defaultAction" in category ? category.defaultAction : undefined, nextPage: pageNumber, nextLimit: limitPerPage },
  );
}

async function ensureInitialState(page: Page, category: EncarCategory, limitPerPage: number) {
  await page.goto(category.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1_500);
  await applyHashState(page, category, 1, limitPerPage);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1_500);
}

async function extractListingsFromDom(page: Page, categoryId: EncarCategoryId) {
  const candidates = await page.evaluate(() => {
    const seen = new Set<string>();
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href*="cardetailview.do"], a[href*="carid="]'),
    );

    return anchors
      .map((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) {
          return null;
        }

        const sourceUrl = new URL(href, window.location.origin).toString();
        const sourceId = new URL(sourceUrl).searchParams.get("carid");
        if (!sourceId || seen.has(sourceId)) {
          return null;
        }
        seen.add(sourceId);

        const container =
          anchor.closest("li, article, tr, .item, .car-item, .sr-photo, .sr-normal, .sr-detail, .list_item, .car_list_item") ??
          anchor.parentElement;
        const image = container?.querySelector<HTMLImageElement>("img");
        const titleNode = container?.querySelector<HTMLElement>("strong, h3, h4, .tit, .title, .name") ?? anchor;
        const containerText = container instanceof HTMLElement ? container.innerText : anchor.innerText;

        return {
          sourceId,
          sourceUrl,
          title: titleNode?.textContent?.trim() ?? anchor.textContent?.trim() ?? "",
          text: containerText ?? "",
          photoUrl:
            image?.getAttribute("src") ??
            image?.getAttribute("data-src") ??
            image?.getAttribute("data-original") ??
            image?.getAttribute("data-lazy") ??
            null,
        };
      })
      .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
  });

  return dedupeListings(
    candidates
      .map((candidate) => normalizeDomCandidate(candidate, categoryId))
      .filter((candidate): candidate is EncarNormalizedListing => Boolean(candidate)),
  );
}

async function scrapeCategory(
  context: BrowserContext,
  category: EncarCategory,
  options: ResolvedOptions,
): Promise<{ listings: EncarNormalizedListing[]; result: EncarCategoryScrapeResult }> {
  const page = await context.newPage();
  const responseListings: EncarNormalizedListing[] = [];
  const responseUrls = new Set<string>();
  const collected = new Map<string, EncarNormalizedListing>();

  page.on("response", async (response) => {
    const listings = await maybeExtractFromResponse(response, category.id);
    if (listings.length > 0) {
      responseUrls.add(response.url());
      responseListings.push(...listings);
    }
  });

  await ensureInitialState(page, category, options.limitPerPage);

  let pageCount = 0;

  for (let pageNumber = 1; pageNumber <= options.maxPagesPerCategory; pageNumber += 1) {
    responseListings.length = 0;

    if (pageNumber > 1) {
      await applyHashState(page, category, pageNumber, options.limitPerPage);
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(1_500);
    }

    const apiListings = dedupeListings(responseListings);
    const domListings = apiListings.length > 0 ? [] : await extractListingsFromDom(page, category.id);
    const pageListings = dedupeListings([...apiListings, ...domListings]);

    if (options.debug) {
      console.info(`[encar] ${category.id} page ${pageNumber}: api=${apiListings.length} dom=${domListings.length}`);
    }

    if (pageListings.length === 0) {
      break;
    }

    pageCount = pageNumber;
    let newItems = 0;
    for (const listing of pageListings) {
      if (collected.has(listing.sourceId)) {
        continue;
      }
      collected.set(listing.sourceId, listing);
      newItems += 1;
    }

    if (newItems === 0) {
      break;
    }

    if (pageListings.length < Math.min(options.limitPerPage, 20)) {
      break;
    }

    await delay(options.requestDelayMs);
  }

  await page.close();

  const listings = Array.from(collected.values());
  return {
    listings,
    result: {
      categoryId: category.id,
      pageCount,
      discoveredCount: listings.length,
      responseUrls: Array.from(responseUrls),
    },
  };
}

export async function scrapeEncarListings(options: EncarScrapeOptions = {}): Promise<EncarScrapeResult> {
  const resolved = resolveOptions(options);
  const categories = selectedCategories(options.categories);
  const browser = await chromium.launch(resolveLaunchOptions(resolved.headless));

  const context = await browser.newContext({
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    userAgent: DEFAULT_USER_AGENT,
    viewport: { width: 1440, height: 1080 },
  });

  try {
    const allListings: EncarNormalizedListing[] = [];
    const results: EncarCategoryScrapeResult[] = [];

    for (const category of categories) {
      const { listings, result } = await scrapeCategory(context, category, resolved);
      allListings.push(...listings);
      results.push(result);
    }

    return {
      listings: dedupeListings(allListings),
      categories: results,
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

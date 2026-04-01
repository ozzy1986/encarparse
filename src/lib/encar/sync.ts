import { Prisma, ScrapeStatus } from "../../generated/prisma/client";
import { getDb } from "../db";
import type { Logger } from "../logger";

import { normalizeVehicleLabels } from "./english";
import { scrapeEncarCategoryPages, type EncarScrapeOptions } from "./client";

function asJson(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export interface EncarSyncSummary {
  runId: string;
  discoveredCount: number;
  upsertedCount: number;
  deactivatedCount: number;
  categories: Array<{
    categoryId: string;
    pageCount: number;
    discoveredCount: number;
  }>;
}

export async function syncEncarListings(options: EncarScrapeOptions & { logger?: Logger } = {}): Promise<EncarSyncSummary> {
  const db = getDb();
  const log = options.logger;
  const seenAt = new Date();
  const run = await db.scrapeRun.create({
    data: {
      source: "encar",
      status: ScrapeStatus.RUNNING,
      metadata: asJson({ options }),
    },
    select: { id: true },
  });

  log?.info(`[sync] run=${run.id} started fullRefresh=${options.fullRefresh ?? false}`);

  try {
    const fullRefresh = options.fullRefresh ?? process.env.SCRAPE_FULL_REFRESH === "true";
    if (fullRefresh) {
      log?.info("[sync] full refresh: deleting all existing encar cars");
      await db.car.deleteMany({ where: { source: "encar" } });
    }

    let discoveredCount = 0;
    let upsertedCount = 0;
    const categoryStats = new Map<string, { pageCount: number; discoveredCount: number }>();

    for await (const page of scrapeEncarCategoryPages(options)) {
      const stat = categoryStats.get(page.categoryId) ?? { pageCount: 0, discoveredCount: 0 };
      stat.pageCount = Math.max(stat.pageCount, page.pageIndex + 1);
      stat.discoveredCount += page.listings.length;
      categoryStats.set(page.categoryId, stat);

      discoveredCount += page.listings.length;

      const existingSet = new Set<string>();
      if (!fullRefresh) {
        const sourceIds = page.listings.map((listing) => listing.sourceId);
        const existing = await db.car.findMany({
          where: { source: "encar", sourceId: { in: sourceIds } },
          select: { sourceId: true },
        });
        for (const row of existing) {
          existingSet.add(row.sourceId);
        }
      }

      const createRows: Prisma.CarCreateManyInput[] = [];
      const updateRows = [];

      for (const listing of page.listings) {
        const normalized = normalizeVehicleLabels({
          make: listing.make,
          model: listing.model,
          title: listing.title,
        });

        const base = {
          source: "encar",
          sourceId: listing.sourceId,
          sourceUrl: listing.sourceUrl,
          category: listing.categoryLabel,
          make: listing.make,
          model: listing.model,
          title: listing.title,
          year: listing.year,
          mileageKm: listing.mileageKm,
          priceKrw: listing.priceKrw,
          currency: "KRW",
          photoUrl: listing.photoUrl,
          isActive: true,
          lastSeenAt: seenAt,
          raw: asJson(listing.raw),
          makeDisplay: normalized.displayMake,
          modelDisplay: normalized.displayModel || normalized.displayTitle.replace(`${normalized.displayMake} `, ""),
          titleDisplay: normalized.displayTitle,
        } satisfies Omit<Prisma.CarCreateManyInput, "id" | "firstSeenAt" | "createdAt" | "updatedAt">;

        if (existingSet.has(listing.sourceId)) {
          updateRows.push(base);
        } else {
          createRows.push({
            ...base,
            firstSeenAt: seenAt,
          });
        }
      }

      if (createRows.length > 0) {
        if (fullRefresh) {
          try {
            await db.car.createMany({ data: createRows });
          } catch (error) {
            const isUnique =
              error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
            if (!isUnique) {
              throw error;
            }
            log?.warn(`[sync] createMany hit P2002 for ${createRows.length} rows, falling back to individual inserts`);
            for (const row of createRows) {
              try {
                await db.car.create({ data: row as Prisma.CarCreateInput });
              } catch (inner) {
                const innerUnique =
                  inner instanceof Prisma.PrismaClientKnownRequestError && inner.code === "P2002";
                if (!innerUnique) {
                  throw inner;
                }
              }
            }
          }
        } else {
          for (const row of createRows) {
            await db.car.create({
              data: row as Prisma.CarCreateInput,
            });
          }
        }
        upsertedCount += createRows.length;
      }

      if (updateRows.length > 0) {
        const chunkSize = 50;
        for (let idx = 0; idx < updateRows.length; idx += chunkSize) {
          const chunk = updateRows.slice(idx, idx + chunkSize);
          await db.$transaction(
            chunk.map((row) =>
              db.car.update({
                where: {
                  source_sourceId: {
                    source: "encar",
                    sourceId: row.sourceId,
                  },
                },
                data: row,
              }),
            ),
          );
          upsertedCount += chunk.length;
        }
      }

      log?.info(`[sync] page done: created=${createRows.length} updated=${updateRows.length} totalUpserted=${upsertedCount}`);
    }

    const deactivated = await db.car.updateMany({
      where: {
        source: "encar",
        isActive: true,
        lastSeenAt: { lt: seenAt },
      },
      data: {
        isActive: false,
      },
    });

    await db.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: ScrapeStatus.SUCCEEDED,
        finishedAt: new Date(),
        discoveredCount,
        upsertedCount,
        deactivatedCount: deactivated.count,
        metadata: asJson({
          options,
          categories: Array.from(categoryStats.entries()).map(([categoryId, stat]) => ({
            categoryId,
            pageCount: stat.pageCount,
            discoveredCount: stat.discoveredCount,
          })),
        }),
      },
    });

    log?.info(`[sync] completed: discovered=${discoveredCount} upserted=${upsertedCount} deactivated=${deactivated.count}`);

    return {
      runId: run.id,
      discoveredCount,
      upsertedCount,
      deactivatedCount: deactivated.count,
      categories: Array.from(categoryStats.entries()).map(([categoryId, stat]) => ({
        categoryId,
        pageCount: stat.pageCount,
        discoveredCount: stat.discoveredCount,
      })),
    };
  } catch (error) {
    log?.error(`[sync] failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
    await db.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: ScrapeStatus.FAILED,
        finishedAt: new Date(),
        error: error instanceof Error ? error.stack ?? error.message : String(error),
      },
    });
    throw error;
  }
}

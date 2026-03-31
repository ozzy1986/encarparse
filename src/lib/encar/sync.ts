import { Prisma, ScrapeStatus } from "../../generated/prisma/client";
import { getDb } from "../db";

import { scrapeEncarListings, type EncarScrapeOptions } from "./client";

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

export async function syncEncarListings(options: EncarScrapeOptions = {}): Promise<EncarSyncSummary> {
  const db = getDb();
  const seenAt = new Date();
  const run = await db.scrapeRun.create({
    data: {
      source: "encar",
      status: ScrapeStatus.RUNNING,
      metadata: asJson({ options }),
    },
    select: { id: true },
  });

  try {
    const scraped = await scrapeEncarListings(options);
    let upsertedCount = 0;

    for (const listing of scraped.listings) {
      await db.car.upsert({
        where: {
          source_sourceId: {
            source: "encar",
            sourceId: listing.sourceId,
          },
        },
        create: {
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
          firstSeenAt: seenAt,
          lastSeenAt: seenAt,
          raw: asJson(listing.raw),
        },
        update: {
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
        },
      });
      upsertedCount += 1;
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
        discoveredCount: scraped.listings.length,
        upsertedCount,
        deactivatedCount: deactivated.count,
        metadata: asJson({
          options,
          categories: scraped.categories,
        }),
      },
    });

    return {
      runId: run.id,
      discoveredCount: scraped.listings.length,
      upsertedCount,
      deactivatedCount: deactivated.count,
      categories: scraped.categories.map((category) => ({
        categoryId: category.categoryId,
        pageCount: category.pageCount,
        discoveredCount: category.discoveredCount,
      })),
    };
  } catch (error) {
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

import { unstable_noStore as noStore } from "next/cache";

import { getDb } from "../db";

export interface HomePageCar {
  id: string;
  category: string | null;
  make: string;
  model: string;
  title: string;
  year: number;
  mileageKm: number;
  priceKrw: number;
  photoUrl: string | null;
  sourceUrl: string;
}

export interface HomePageStats {
  totalCars: number;
  brandCount: number;
  lastSyncedAt: Date | null;
}

export interface MakeCount {
  make: string;
  count: number;
}

export interface HomePageFilters {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  years: number[];
}

export interface HomePageData {
  cars: HomePageCar[];
  featuredMakes: string[];
  stats: HomePageStats;
  makeCounts: MakeCount[];
  filters: HomePageFilters;
}

export async function getHomepageData(): Promise<HomePageData> {
  noStore();

  const db = getDb();
  const [cars, totalCars, makeRows, lastRun, filterRows] = await Promise.all([
    db.car.findMany({
      where: { isActive: true },
      orderBy: [{ lastSeenAt: "desc" }, { year: "desc" }],
      take: 60,
      select: {
        id: true,
        category: true,
        make: true,
        model: true,
        title: true,
        year: true,
        mileageKm: true,
        priceKrw: true,
        photoUrl: true,
        sourceUrl: true,
      },
    }),
    db.car.count({ where: { isActive: true } }),
    db.car.findMany({
      where: { isActive: true },
      select: { make: true },
    }),
    db.scrapeRun.findFirst({
      where: { source: "encar", status: "SUCCEEDED" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    }),
    db.car.findMany({
      where: { isActive: true },
      select: {
        make: true,
        model: true,
        year: true,
      },
      orderBy: [{ make: "asc" }, { model: "asc" }, { year: "desc" }],
      take: 300,
    }),
  ]);

  const makeCountMap = new Map<string, number>();
  for (const row of makeRows) {
    makeCountMap.set(row.make, (makeCountMap.get(row.make) ?? 0) + 1);
  }

  const makeCounts = Array.from(makeCountMap.entries())
    .map(([make, count]) => ({ make, count }))
    .sort((left, right) => right.count - left.count || left.make.localeCompare(right.make))
    .slice(0, 18);

  const modelsByBrandMap = new Map<string, Set<string>>();
  const yearSet = new Set<number>();
  for (const row of filterRows) {
    yearSet.add(row.year);
    if (!modelsByBrandMap.has(row.make)) {
      modelsByBrandMap.set(row.make, new Set());
    }
    modelsByBrandMap.get(row.make)?.add(row.model);
  }

  const modelsByBrand = Object.fromEntries(
    Array.from(modelsByBrandMap.entries()).map(([make, models]) => [
      make,
      Array.from(models).sort((left, right) => left.localeCompare(right)),
    ]),
  );

  return {
    cars,
    featuredMakes: makeCounts.slice(0, 5).map((item) => item.make),
    stats: {
      totalCars,
      brandCount: makeCountMap.size,
      lastSyncedAt: lastRun?.finishedAt ?? null,
    },
    makeCounts,
    filters: {
      brands: Object.keys(modelsByBrand).sort((left, right) => left.localeCompare(right)),
      modelsByBrand,
      years: Array.from(yearSet).sort((left, right) => right - left),
    },
  };
}

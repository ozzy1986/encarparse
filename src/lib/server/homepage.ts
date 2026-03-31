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

export interface HomePageData {
  cars: HomePageCar[];
  featuredMakes: string[];
  stats: HomePageStats;
}

export async function getHomepageData(): Promise<HomePageData> {
  noStore();

  const db = getDb();
  const [cars, totalCars, distinctMakes, lastRun] = await Promise.all([
    db.car.findMany({
      where: { isActive: true },
      orderBy: [{ lastSeenAt: "desc" }, { year: "desc" }],
      take: 18,
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
      distinct: ["make"],
      select: { make: true },
    }),
    db.scrapeRun.findFirst({
      where: { source: "encar", status: "SUCCEEDED" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    }),
  ]);

  return {
    cars,
    featuredMakes: Array.from(new Set(cars.map((car) => car.make))).slice(0, 6),
    stats: {
      totalCars,
      brandCount: distinctMakes.length,
      lastSyncedAt: lastRun?.finishedAt ?? null,
    },
  };
}

import { unstable_noStore as noStore } from "next/cache";

import { normalizeVehicleLabels } from "@/lib/encar/english";

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

export interface HomePageSelectedFilters {
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
}

export interface HomePageData {
  cars: HomePageCar[];
  featuredMakes: string[];
  stats: HomePageStats;
  makeCounts: MakeCount[];
  filters: HomePageFilters;
  matchingCount: number;
  selectedFilters: HomePageSelectedFilters;
}

interface ActiveCarRow {
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
  lastSeenAt: Date;
}

function normalizeFilterValue(value?: string) {
  return value?.trim() ?? "";
}

function normalizeYearValue(value?: string, years?: number[]) {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return "";
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && years?.includes(parsed) ? String(parsed) : "";
}

export async function getHomepageData(
  requestedFilters: Partial<HomePageSelectedFilters> = {},
): Promise<HomePageData> {
  noStore();

  const db = getDb();
  const [rawCars, lastRun] = await Promise.all([
    db.car.findMany({
      where: { isActive: true },
      orderBy: [{ lastSeenAt: "desc" }, { year: "desc" }],
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
        lastSeenAt: true,
      },
    }),
    db.scrapeRun.findFirst({
      where: { source: "encar", status: "SUCCEEDED" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    }),
  ]);

  const normalizedCars: Array<HomePageCar & { lastSeenAt: Date }> = rawCars.map((car: ActiveCarRow) => {
    const normalized = normalizeVehicleLabels({
      make: car.make,
      model: car.model,
      title: car.title,
    });

    return {
      id: car.id,
      category: car.category,
      make: normalized.displayMake,
      model: normalized.displayModel || normalized.displayTitle.replace(`${normalized.displayMake} `, ""),
      title: normalized.displayTitle,
      year: car.year,
      mileageKm: car.mileageKm,
      priceKrw: car.priceKrw,
      photoUrl: car.photoUrl,
      sourceUrl: car.sourceUrl,
      lastSeenAt: car.lastSeenAt,
    };
  });

  const makeCountMap = new Map<string, number>();
  const modelsByBrandMap = new Map<string, Set<string>>();
  const yearSet = new Set<number>();

  for (const car of normalizedCars) {
    makeCountMap.set(car.make, (makeCountMap.get(car.make) ?? 0) + 1);
    yearSet.add(car.year);
    if (!modelsByBrandMap.has(car.make)) {
      modelsByBrandMap.set(car.make, new Set());
    }
    modelsByBrandMap.get(car.make)?.add(car.model);
  }

  const modelsByBrand = Object.fromEntries(
    Array.from(modelsByBrandMap.entries()).map(([make, models]) => [
      make,
      Array.from(models).sort((left, right) => left.localeCompare(right)),
    ]),
  );

  const availableBrands = Object.keys(modelsByBrand).sort((left, right) => left.localeCompare(right));
  const availableYears = Array.from(yearSet).sort((left, right) => right - left);

  const brand = availableBrands.includes(normalizeFilterValue(requestedFilters.brand))
    ? normalizeFilterValue(requestedFilters.brand)
    : "";
  const modelCandidate = normalizeFilterValue(requestedFilters.model);
  const modelOptions = brand ? modelsByBrand[brand] ?? [] : Array.from(new Set(Object.values(modelsByBrand).flat()));
  const model = modelOptions.includes(modelCandidate) ? modelCandidate : "";
  const yearFrom = normalizeYearValue(requestedFilters.yearFrom, availableYears);
  const yearTo = normalizeYearValue(requestedFilters.yearTo, availableYears);

  const matchingCars = normalizedCars.filter((car) => {
    if (brand && car.make !== brand) {
      return false;
    }
    if (model && car.model !== model) {
      return false;
    }
    if (yearFrom && car.year < Number(yearFrom)) {
      return false;
    }
    if (yearTo && car.year > Number(yearTo)) {
      return false;
    }
    return true;
  });

  const makeCounts = Array.from(makeCountMap.entries())
    .map(([make, count]) => ({ make, count }))
    .sort((left, right) => right.count - left.count || left.make.localeCompare(right.make))
    .slice(0, 18);

  return {
    cars: matchingCars.slice(0, 24).map((car) => ({
      id: car.id,
      category: car.category,
      make: car.make,
      model: car.model,
      title: car.title,
      year: car.year,
      mileageKm: car.mileageKm,
      priceKrw: car.priceKrw,
      photoUrl: car.photoUrl,
      sourceUrl: car.sourceUrl,
    })),
    featuredMakes: makeCounts.slice(0, 5).map((item) => item.make),
    stats: {
      totalCars: normalizedCars.length,
      brandCount: makeCountMap.size,
      lastSyncedAt: lastRun?.finishedAt ?? null,
    },
    makeCounts,
    filters: {
      brands: availableBrands,
      modelsByBrand,
      years: availableYears,
    },
    matchingCount: matchingCars.length,
    selectedFilters: {
      brand,
      model,
      yearFrom,
      yearTo,
    },
  };
}

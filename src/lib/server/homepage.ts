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

export interface HomePageSelectedFilters {
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  page: string;
  pageSize: string;
}

export interface HomePageData {
  cars: HomePageCar[];
  featuredMakes: string[];
  stats: HomePageStats;
  makeCounts: MakeCount[];
  filters: HomePageFilters;
  matchingCount: number;
  selectedFilters: HomePageSelectedFilters;
  page: number;
  pageSize: number;
  pageCount: number;
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

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const asInt = Math.floor(parsed);
  return asInt > 0 ? asInt : fallback;
}

export async function getHomepageData(
  requestedFilters: Partial<HomePageSelectedFilters> = {},
): Promise<HomePageData> {
  noStore();

  const db = getDb();
  const [brandsDistinct, modelsDistinct, yearsDistinct, makeCountsRaw, lastRun, totalCars] = await Promise.all([
    db.car.findMany({
      where: { isActive: true, makeDisplay: { not: "" } },
      distinct: ["makeDisplay"],
      select: { makeDisplay: true },
    }),
    db.car.findMany({
      where: { isActive: true, makeDisplay: { not: "" }, modelDisplay: { not: "" } },
      distinct: ["makeDisplay", "modelDisplay"],
      select: { makeDisplay: true, modelDisplay: true },
    }),
    db.car.findMany({
      where: { isActive: true },
      distinct: ["year"],
      select: { year: true },
    }),
    db.car.groupBy({
      by: ["makeDisplay"],
      where: { isActive: true, makeDisplay: { not: "" } },
      _count: { makeDisplay: true },
      orderBy: [{ _count: { makeDisplay: "desc" } }, { makeDisplay: "asc" }],
    }),
    db.scrapeRun.findFirst({
      where: { source: "encar", status: "SUCCEEDED" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    }),
    db.car.count({ where: { isActive: true } }),
  ]);

  const modelsByBrandMap = new Map<string, Set<string>>();
  for (const row of modelsDistinct) {
    const make = row.makeDisplay;
    const model = row.modelDisplay;
    if (!make || !model) {
      continue;
    }
    if (!modelsByBrandMap.has(make)) {
      modelsByBrandMap.set(make, new Set());
    }
    modelsByBrandMap.get(make)?.add(model);
  }

  const modelsByBrand = Object.fromEntries(
    Array.from(modelsByBrandMap.entries()).map(([make, models]) => [
      make,
      Array.from(models).sort((left, right) => left.localeCompare(right)),
    ]),
  );

  const availableBrands = brandsDistinct
    .map((row) => row.makeDisplay)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));

  const availableYears = yearsDistinct
    .map((row) => row.year)
    .filter((year): year is number => typeof year === "number" && Number.isFinite(year))
    .sort((left, right) => right - left);

  const brand = availableBrands.includes(normalizeFilterValue(requestedFilters.brand))
    ? normalizeFilterValue(requestedFilters.brand)
    : "";
  const modelCandidate = normalizeFilterValue(requestedFilters.model);
  const modelOptions = brand ? modelsByBrand[brand] ?? [] : Array.from(new Set(Object.values(modelsByBrand).flat()));
  const model = modelOptions.includes(modelCandidate) ? modelCandidate : "";
  const yearFrom = normalizeYearValue(requestedFilters.yearFrom, availableYears);
  const yearTo = normalizeYearValue(requestedFilters.yearTo, availableYears);

  const page = String(requestedFilters.page ?? "").trim();
  const pageSize = String(requestedFilters.pageSize ?? "").trim();
  const parsedPage = parsePositiveInt(page, 1);
  const parsedPageSize = Math.min(parsePositiveInt(pageSize, 24), 60);
  const skip = (parsedPage - 1) * parsedPageSize;

  const where = {
    isActive: true,
    ...(brand ? { makeDisplay: brand } : {}),
    ...(model ? { modelDisplay: model } : {}),
    ...(yearFrom || yearTo
      ? {
          year: {
            ...(yearFrom ? { gte: Number(yearFrom) } : {}),
            ...(yearTo ? { lte: Number(yearTo) } : {}),
          },
        }
      : {}),
  };

  const [matchingCount, cars] = await Promise.all([
    db.car.count({ where }),
    db.car.findMany({
      where,
      orderBy: [{ lastSeenAt: "desc" }, { year: "desc" }],
      skip,
      take: parsedPageSize,
      select: {
        id: true,
        category: true,
        make: true,
        model: true,
        title: true,
        makeDisplay: true,
        modelDisplay: true,
        titleDisplay: true,
        year: true,
        mileageKm: true,
        priceKrw: true,
        photoUrl: true,
        sourceUrl: true,
      },
    }),
  ]);

  const makeCounts = makeCountsRaw
    .map((row) => ({
      make: row.makeDisplay,
      count: row._count.makeDisplay,
    }))
    .filter((row) => row.make && row.make !== "Other");

  const pageCount = Math.max(1, Math.ceil(matchingCount / parsedPageSize));

  return {
    cars: cars.map((car) => ({
      id: car.id,
      category: car.category,
      make: car.makeDisplay || "—",
      model: car.modelDisplay || "—",
      title: car.titleDisplay || `${car.makeDisplay || ""} ${car.modelDisplay || ""}`.trim() || "—",
      year: car.year,
      mileageKm: car.mileageKm,
      priceKrw: car.priceKrw,
      photoUrl: car.photoUrl,
      sourceUrl: car.sourceUrl,
    })),
    featuredMakes: makeCounts.slice(0, 5).map((item) => item.make),
    stats: {
      totalCars,
      brandCount: availableBrands.length,
      lastSyncedAt: lastRun?.finishedAt ?? null,
    },
    makeCounts,
    filters: {
      brands: availableBrands,
      modelsByBrand,
      years: availableYears,
    },
    matchingCount,
    selectedFilters: {
      brand,
      model,
      yearFrom,
      yearTo,
      page: String(parsedPage),
      pageSize: String(parsedPageSize),
    },
    page: parsedPage,
    pageSize: parsedPageSize,
    pageCount,
  };
}

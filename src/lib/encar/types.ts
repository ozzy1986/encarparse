export const ENCAR_BASE_URL = "https://www.encar.com";

export const ENCAR_CATEGORIES = [
  {
    id: "domestic",
    label: "Domestic",
    carType: "kor",
    url: `${ENCAR_BASE_URL}/dc/dc_carsearchlist.do?carType=kor`,
    defaultAction: "(And.Hidden.N._.CarType.Y.)",
  },
  {
    id: "imported",
    label: "Imported",
    carType: "for",
    url: `${ENCAR_BASE_URL}/fc/fc_carsearchlist.do?carType=for`,
    defaultAction: "(And.Hidden.N._.CarType.N.)",
  },
  {
    id: "electric",
    label: "Electric",
    carType: "ev",
    url: `${ENCAR_BASE_URL}/ev/ev_carsearchlist.do?carType=ev`,
  },
] as const;

export type EncarCategory = (typeof ENCAR_CATEGORIES)[number];
export type EncarCategoryId = EncarCategory["id"];

export interface EncarNormalizedListing {
  sourceId: string;
  sourceUrl: string;
  categoryId: EncarCategoryId;
  categoryLabel: string;
  make: string;
  model: string;
  title: string;
  year: number;
  mileageKm: number;
  priceKrw: number;
  photoUrl: string | null;
  raw: Record<string, unknown>;
}

export interface EncarCategoryScrapeResult {
  categoryId: EncarCategoryId;
  pageCount: number;
  discoveredCount: number;
  responseUrls: string[];
}

export interface EncarScrapeResult {
  listings: EncarNormalizedListing[];
  categories: EncarCategoryScrapeResult[];
}

export const ENCAR_BASE_URL = "https://www.encar.com";
export const ENCAR_API_BASE_URL = "http://api.encar.com";
export const ENCAR_IMAGE_BASE_URL = "https://ci.encar.com";

export const ENCAR_CATEGORIES = [
  {
    id: "domestic",
    label: "Domestic",
    carType: "kor",
    apiQuery: "(And.Hidden.N._.CarType.Y.)",
    detailPath: "/dc/dc_cardetailview.do",
  },
  {
    id: "imported",
    label: "Imported",
    carType: "for",
    apiQuery: "(And.Hidden.N._.CarType.N.)",
    detailPath: "/fc/fc_cardetailview.do",
  },
] as const;

export type EncarCategory = (typeof ENCAR_CATEGORIES)[number];
export type EncarCategoryId = EncarCategory["id"];

export interface EncarApiPhoto {
  type?: string;
  location?: string;
  updatedDate?: string;
  ordering?: number;
}

export interface EncarApiRecord {
  Id?: string;
  Manufacturer?: string;
  Model?: string;
  Badge?: string;
  BadgeDetail?: string;
  FormYear?: string;
  Year?: number;
  Mileage?: number;
  Price?: number;
  Photo?: string;
  Photos?: EncarApiPhoto[];
  FuelType?: string;
  GreenType?: string;
  EvType?: string;
  SellType?: string;
  OfficeCityState?: string;
  [key: string]: unknown;
}

export interface EncarApiResponse {
  Count?: number;
  SearchResults?: EncarApiRecord[];
  [key: string]: unknown;
}

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

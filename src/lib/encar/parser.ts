import { ENCAR_CATEGORIES, ENCAR_BASE_URL, type EncarCategoryId, type EncarNormalizedListing } from "./types";

type AnyRecord = Record<string, unknown>;

const CATEGORY_LABELS = Object.fromEntries(
  ENCAR_CATEGORIES.map((category) => [category.id, category.label]),
) as Record<EncarCategoryId, string>;

const ID_KEYS = ["id", "Id", "carId", "CarId", "advNo", "AdvNo", "advertisementNo"];
const URL_KEYS = ["url", "Url", "viewUrl", "ViewUrl", "linkUrl", "LinkUrl", "detailUrl", "DetailUrl"];
const TITLE_KEYS = ["title", "Title", "carName", "CarName", "displayTitle", "DisplayTitle", "vehicleName"];
const MAKE_KEYS = ["make", "Make", "maker", "Maker", "makerName", "MakerName", "manufacturer", "Manufacturer", "brand", "Brand", "mnfctNm"];
const MODEL_KEYS = ["model", "Model", "modelName", "ModelName", "grade", "Grade", "trim", "Trim", "mdlNm", "subModelName"];
const YEAR_KEYS = ["year", "Year", "modelYear", "ModelYear", "yearMonth", "YearMonth", "formYear"];
const MILEAGE_KEYS = ["mileage", "Mileage", "mileageKm", "MileageKm", "distance", "Distance", "odo", "Odo", "km", "Km", "drivenDistance"];
const PRICE_KEYS = ["price", "Price", "salePrice", "SalePrice", "advPrice", "AdvPrice", "sellPrice", "SellPrice", "retailPrice"];
const PHOTO_KEYS = ["photo", "Photo", "photoUrl", "PhotoUrl", "imageUrl", "ImageUrl", "thumbnailUrl", "ThumbnailUrl", "mainImageUrl", "mainImgUrl", "imgUrl"];

const KNOWN_MAKES = [
  "ROLLS ROYCE",
  "MERCEDES-BENZ",
  "LAND ROVER",
  "ALFA ROMEO",
  "ASTON MARTIN",
  "BENTLEY",
  "CADILLAC",
  "CHEVROLET",
  "FERRARI",
  "GENESIS",
  "HYUNDAI",
  "INFINITI",
  "JAGUAR",
  "LAMBORGHINI",
  "MASERATI",
  "MCLAREN",
  "MERCEDES",
  "PORSCHE",
  "RENAULT KOREA",
  "RENAULT SAMSUNG",
  "ROLLS-ROYCE",
  "SSANGYONG",
  "KG MOBILITY",
  "VOLKSWAGEN",
  "LEXUS",
  "NISSAN",
  "TESLA",
  "TOYOTA",
  "VOLVO",
  "AUDI",
  "BMW",
  "FORD",
  "JEEP",
  "KIA",
  "MINI",
].sort((left, right) => right.length - left.length);

const CONSULTATION_PATTERN = /(?:\uC0C1\uB2F4|\uBB38\uC758|\uC804\uD654)/i;
const MANWON_PATTERN = /([\d.,]+)(?:\uB9CC\uC6D0|\uB9CC)/i;
const KM_PATTERN = /([\d,]+)\s*(?:km|KM|\u339E)/;
const YEAR_LINE_PATTERN = /(?:19|20)\d{2}|\b\d{2}[./\uB144-]/;
const TITLE_SKIP_PATTERN = /([\d,]+\s*(?:km|KM|\u339E|\uB9CC\uC6D0|\uB9CC|\uC6D0))/i;
const STATUS_TOKEN_PATTERN = /^(?:\uCC1C|\uC9C4\uB2E8(?:\+{1,2})?|\uBCF4\uC99D|\uBB34\uC0AC\uACE0|\uD5DB\uAC78\uC74C\uBCF4\uC0C1|\uC5D4\uCE74\uBBFF\uACE0)$/;

export interface EncarDomCandidate {
  sourceId?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
  text?: string | null;
  photoUrl?: string | null;
  raw?: Record<string, unknown>;
}

function toRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as AnyRecord;
}

function stringifyValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildLookup(record: AnyRecord) {
  const lookup = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    lookup.set(key.toLowerCase(), value);
  }
  return lookup;
}

function pickValue(record: AnyRecord, keys: string[]) {
  const lookup = buildLookup(record);
  for (const key of keys) {
    const value = lookup.get(key.toLowerCase());
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function pickString(record: AnyRecord, keys: string[]) {
  return stringifyValue(pickValue(record, keys));
}

function sanitizeRecord(record: unknown) {
  return JSON.parse(JSON.stringify(record ?? {})) as Record<string, unknown>;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);
}

function firstMatchingLine(value: string, pattern: RegExp) {
  return splitLines(value).find((line) => pattern.test(line)) ?? null;
}

export function normalizePhotoUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${ENCAR_BASE_URL}${trimmed}`;
  }

  return trimmed;
}

export function extractSourceIdFromUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(normalizePhotoUrl(url) ?? url, ENCAR_BASE_URL);
    return parsed.searchParams.get("carid") ?? parsed.searchParams.get("id") ?? null;
  } catch {
    return null;
  }
}

export function parsePriceKrw(value: unknown): number | null {
  const numeric = numberValue(value);
  if (numeric !== null) {
    if (numeric <= 0) {
      return null;
    }

    return numeric < 1_000_000 ? Math.round(numeric * 10_000) : Math.round(numeric);
  }

  const text = normalizeWhitespace(stringifyValue(value) ?? "");
  if (!text || CONSULTATION_PATTERN.test(text)) {
    return null;
  }

  const compact = text.replace(/\s+/g, "");

  if (compact.includes("억")) {
    const eokMatch = compact.match(/(?:(\d[\d,]*)억)?(?:(\d[\d,]*)(?:만원|만)?)?/);
    if (eokMatch) {
      const eokValue = eokMatch[1] ? Number(eokMatch[1].replace(/,/g, "")) : 0;
      const manValue = eokMatch[2] ? Number(eokMatch[2].replace(/,/g, "")) : 0;
      const total = eokValue * 100_000_000 + manValue * 10_000;
      if (Number.isFinite(total) && total > 0) {
        return total;
      }
    }
  }

  const manwonMatch = compact.match(MANWON_PATTERN);
  if (manwonMatch) {
    const parsed = Number(manwonMatch[1].replace(/,/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 10_000) : null;
  }

  const krwMatch = compact.match(/₩?([\d,]+)/);
  if (!krwMatch) {
    return null;
  }

  const parsed = Number(krwMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed < 1_000_000 ? Math.round(parsed * 10_000) : parsed;
}

export function parseMileageKm(value: unknown): number | null {
  const numeric = numberValue(value);
  if (numeric !== null) {
    return numeric > 0 ? Math.round(numeric) : null;
  }

  const text = normalizeWhitespace(stringifyValue(value) ?? "");
  if (!text) {
    return null;
  }

  const match = text.match(KM_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseYear(value: unknown): number | null {
  const numeric = numberValue(value);
  const currentYear = new Date().getFullYear() + 1;

  if (numeric !== null) {
    if (numeric >= 1950 && numeric <= currentYear) {
      return Math.round(numeric);
    }

    if (numeric >= 100_000 && numeric <= 999_999) {
      const sixDigitYear = Number(String(Math.round(numeric)).slice(0, 4));
      if (sixDigitYear >= 1950 && sixDigitYear <= currentYear) {
        return sixDigitYear;
      }
    }
  }

  const text = normalizeWhitespace(stringifyValue(value) ?? "");
  if (!text) {
    return null;
  }

  const fourDigitMatch = text.match(/((?:19|20)\d{2})/);
  if (fourDigitMatch) {
    return Number(fourDigitMatch[1]);
  }

  const shortMatch = text.match(/\b(\d{2})(?:(?:[./-]\d{1,2})(?:\uC2DD|\uB144\uD615)?|\uC2DD|\uB144\uD615)/);
  if (!shortMatch) {
    return null;
  }

  const shortYear = Number(shortMatch[1]);
  return shortYear <= 29 ? 2000 + shortYear : 1900 + shortYear;
}

function pickPhotoUrl(record: AnyRecord) {
  const direct = normalizePhotoUrl(pickString(record, PHOTO_KEYS));
  if (direct) {
    return direct;
  }

  const candidates = [record.photos, record.Images, record.imageList, record.PhotoInfos, record.PhotoList];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      const first = candidate[0];
      if (typeof first === "string") {
        return normalizePhotoUrl(first);
      }

      const photoRecord = toRecord(first);
      if (photoRecord) {
        const nested = normalizePhotoUrl(pickString(photoRecord, PHOTO_KEYS));
        if (nested) {
          return nested;
        }
      }
    }

    const photoRecord = toRecord(candidate);
    if (photoRecord) {
      const nested = normalizePhotoUrl(pickString(photoRecord, PHOTO_KEYS));
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function stripStatusTokens(value: string) {
  return normalizeWhitespace(
    value
      .split(" ")
      .filter((token) => !STATUS_TOKEN_PATTERN.test(token))
      .join(" "),
  );
}

function guessTitleFromText(text: string) {
  const firstLine = splitLines(text)[0] ?? "";
  const cleanedFirstLine = stripStatusTokens(firstLine);
  const yearIndex = cleanedFirstLine.search(/(?:19|20)\d{2}|\b\d{2}(?:(?:[./-]\d{1,2})(?:식|년형)?|식|년형)/);
  const trimmedTitle = yearIndex > 0 ? cleanedFirstLine.slice(0, yearIndex).trim() : cleanedFirstLine;
  if (trimmedTitle && !TITLE_SKIP_PATTERN.test(trimmedTitle) && !CONSULTATION_PATTERN.test(trimmedTitle)) {
    return trimmedTitle;
  }

  for (const line of splitLines(text)) {
    const cleanedLine = stripStatusTokens(line);
    if (TITLE_SKIP_PATTERN.test(cleanedLine) || CONSULTATION_PATTERN.test(cleanedLine)) {
      continue;
    }

    if (cleanedLine.length < 3) {
      continue;
    }

    return cleanedLine;
  }

  return null;
}

function chooseDomTitle(domTitle: string | null | undefined, text: string) {
  const normalizedDomTitle = normalizeWhitespace(domTitle ?? "");
  const guessedTitle = guessTitleFromText(text) ?? "";

  if (!normalizedDomTitle) {
    return guessedTitle;
  }

  if (STATUS_TOKEN_PATTERN.test(normalizedDomTitle) || (normalizedDomTitle.split(" ").length === 1 && guessedTitle.length > normalizedDomTitle.length)) {
    return guessedTitle || normalizedDomTitle;
  }

  if (guessedTitle.length > normalizedDomTitle.length + 4) {
    return guessedTitle;
  }

  return normalizedDomTitle;
}

export function splitMakeAndModel(title: string) {
  const normalizedTitle = normalizeWhitespace(title);
  if (!normalizedTitle) {
    return null;
  }

  const upperTitle = normalizedTitle.toUpperCase();
  for (const make of KNOWN_MAKES) {
    const upperMake = make.toUpperCase();
    if (upperTitle === upperMake) {
      return { make, model: normalizedTitle };
    }

    if (upperTitle.startsWith(`${upperMake} `)) {
      return {
        make,
        model: normalizedTitle.slice(make.length).trim(),
      };
    }
  }

  const [first, ...rest] = normalizedTitle.split(" ");
  if (!first) {
    return null;
  }

  return {
    make: first,
    model: rest.join(" ").trim() || normalizedTitle,
  };
}

function buildTitle(make: string, model: string, title: string) {
  const normalizedTitle = normalizeWhitespace(title);
  if (normalizedTitle) {
    return normalizedTitle;
  }

  return normalizeWhitespace(`${make} ${model}`);
}

function looksLikeListingRecord(record: AnyRecord) {
  const sourceUrl = normalizePhotoUrl(pickString(record, URL_KEYS));
  const sourceId = pickString(record, ID_KEYS) ?? extractSourceIdFromUrl(sourceUrl);
  const title = pickString(record, TITLE_KEYS);
  const year = parseYear(pickValue(record, YEAR_KEYS));
  const mileage = parseMileageKm(pickValue(record, MILEAGE_KEYS));
  const price = parsePriceKrw(pickValue(record, PRICE_KEYS));

  return Boolean(sourceId || sourceUrl) && Boolean(title || pickString(record, MAKE_KEYS)) && [year, mileage, price].filter((item) => item !== null).length >= 2;
}

export function normalizeApiListing(record: AnyRecord, categoryId: EncarCategoryId): EncarNormalizedListing | null {
  const sourceUrl = normalizePhotoUrl(pickString(record, URL_KEYS));
  const sourceId = pickString(record, ID_KEYS) ?? extractSourceIdFromUrl(sourceUrl);
  const rawTitle = pickString(record, TITLE_KEYS) ?? "";
  const explicitMake = pickString(record, MAKE_KEYS);
  const explicitModel = pickString(record, MODEL_KEYS);
  const makeAndModel =
    explicitMake && explicitModel
      ? {
          make: normalizeWhitespace(explicitMake),
          model: normalizeWhitespace(explicitModel),
        }
      : splitMakeAndModel(rawTitle);
  const year = parseYear(pickValue(record, YEAR_KEYS));
  const mileageKm = parseMileageKm(pickValue(record, MILEAGE_KEYS));
  const priceKrw = parsePriceKrw(pickValue(record, PRICE_KEYS));

  if (!sourceId || !sourceUrl || !makeAndModel || !year || !mileageKm || !priceKrw) {
    return null;
  }

  return {
    sourceId,
    sourceUrl,
    categoryId,
    categoryLabel: CATEGORY_LABELS[categoryId],
    make: makeAndModel.make,
    model: makeAndModel.model,
    title: buildTitle(makeAndModel.make, makeAndModel.model, rawTitle),
    year,
    mileageKm,
    priceKrw,
    photoUrl: pickPhotoUrl(record),
    raw: sanitizeRecord(record),
  };
}

export function normalizeDomCandidate(candidate: EncarDomCandidate, categoryId: EncarCategoryId): EncarNormalizedListing | null {
  const sourceUrl = normalizePhotoUrl(candidate.sourceUrl);
  const sourceId = candidate.sourceId ?? extractSourceIdFromUrl(sourceUrl);
  const text = normalizeWhitespace(candidate.text ?? "");
  const title = chooseDomTitle(candidate.title, text);
  const makeAndModel = splitMakeAndModel(title);
  const year = parseYear(firstMatchingLine(text, YEAR_LINE_PATTERN) ?? title);
  const mileageKm = parseMileageKm(firstMatchingLine(text, KM_PATTERN) ?? text);
  const priceKrw = parsePriceKrw(firstMatchingLine(text, /(?:\uB9CC\uC6D0|\uB9CC|\uC6D0|\u20A9)/) ?? text);

  if (!sourceId || !sourceUrl || !makeAndModel || !year || !mileageKm || !priceKrw) {
    return null;
  }

  return {
    sourceId,
    sourceUrl,
    categoryId,
    categoryLabel: CATEGORY_LABELS[categoryId],
    make: makeAndModel.make,
    model: makeAndModel.model,
    title: buildTitle(makeAndModel.make, makeAndModel.model, title),
    year,
    mileageKm,
    priceKrw,
    photoUrl: normalizePhotoUrl(candidate.photoUrl),
    raw: sanitizeRecord({ ...candidate.raw, text }),
  };
}

export function extractListingsFromPayload(payload: unknown, categoryId: EncarCategoryId) {
  const candidates: AnyRecord[] = [];
  const visited = new WeakSet<object>();

  function walk(node: unknown) {
    if (Array.isArray(node)) {
      const objects = node.map((item) => toRecord(item)).filter(Boolean) as AnyRecord[];
      if (objects.length > 0 && objects.some((record) => looksLikeListingRecord(record))) {
        candidates.push(...objects);
        return;
      }

      for (const item of node) {
        walk(item);
      }
      return;
    }

    const record = toRecord(node);
    if (!record || visited.has(record)) {
      return;
    }
    visited.add(record);

    if (looksLikeListingRecord(record)) {
      candidates.push(record);
    }

    for (const value of Object.values(record)) {
      walk(value);
    }
  }

  walk(payload);

  const seen = new Set<string>();
  const listings: EncarNormalizedListing[] = [];
  for (const candidate of candidates) {
    const normalized = normalizeApiListing(candidate, categoryId);
    if (!normalized || seen.has(normalized.sourceId)) {
      continue;
    }
    seen.add(normalized.sourceId);
    listings.push(normalized);
  }

  return listings;
}

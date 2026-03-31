import { describe, expect, it } from "vitest";

import {
  extractSourceIdFromUrl,
  normalizeDomCandidate,
  parseMileageKm,
  parsePriceKrw,
  parseYear,
  splitMakeAndModel,
} from "./parser";

describe("ENCAR parser helpers", () => {
  it("parses Korean price formats", () => {
    expect(parsePriceKrw("3,250 \uB9CC\uC6D0")).toBe(32_500_000);
    expect(parsePriceKrw("\u20A942,300,000")).toBe(42_300_000);
    expect(parsePriceKrw(3250)).toBe(32_500_000);
  });

  it("parses mileage text", () => {
    expect(parseMileageKm("12,345km")).toBe(12_345);
    expect(parseMileageKm("98,100 \u339E")).toBe(98_100);
  });

  it("parses full and short year formats", () => {
    expect(parseYear("2023/08")).toBe(2023);
    expect(parseYear("23/08\uC2DD")).toBe(2023);
  });

  it("splits known makes from titles", () => {
    expect(splitMakeAndModel("LAND ROVER RANGE ROVER SPORT")).toEqual({
      make: "LAND ROVER",
      model: "RANGE ROVER SPORT",
    });
    expect(splitMakeAndModel("BMW 320i M Sport")).toEqual({
      make: "BMW",
      model: "320i M Sport",
    });
  });

  it("extracts car ids from detail URLs", () => {
    expect(
      extractSourceIdFromUrl("https://www.encar.com/dc/dc_cardetailview.do?carid=12345678"),
    ).toBe("12345678");
  });

  it("normalizes a DOM candidate into a stored listing", () => {
    const listing = normalizeDomCandidate(
      {
        sourceId: "12345678",
        sourceUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=12345678",
        title: "BMW 320i M Sport",
        text: "BMW 320i M Sport\n2021/03\n41,200km\n3,580 \uB9CC\uC6D0",
        photoUrl: "//ci.encar.com/car.jpg",
      },
      "imported",
    );

    expect(listing).toMatchObject({
      sourceId: "12345678",
      make: "BMW",
      model: "320i M Sport",
      year: 2021,
      mileageKm: 41_200,
      priceKrw: 35_800_000,
      photoUrl: "https://ci.encar.com/car.jpg",
    });
  });
});

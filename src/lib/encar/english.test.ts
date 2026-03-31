import { describe, expect, it } from "vitest";

import { normalizeDisplayMake, normalizeVehicleLabels } from "./english";

describe("ENCAR English normalization", () => {
  it("normalizes domestic brand names to English", () => {
    expect(normalizeDisplayMake("\uD604\uB300")).toBe("Hyundai");
    expect(normalizeDisplayMake("\uAE30\uC544")).toBe("Kia");
    expect(normalizeDisplayMake("\uC81C\uB124\uC2DC\uC2A4")).toBe("Genesis");
  });

  it("normalizes domestic title and model text to English", () => {
    expect(
      normalizeVehicleLabels({
        make: "\uAE30\uC544",
        model: "\uC3D8\uB80C\uD1A0 4\uC138\uB300 HEV 1.6 4WD \uC2DC\uADF8\uB2C8\uCC98",
        title: "\uAE30\uC544 \uC3D8\uB80C\uD1A0 4\uC138\uB300 HEV 1.6 4WD \uC2DC\uADF8\uB2C8\uCC98",
      }),
    ).toMatchObject({
      displayMake: "Kia",
      displayModel: "Sorento 4th Generation HEV 1.6 4WD Signature",
      displayTitle: "Kia Sorento 4th Generation HEV 1.6 4WD Signature",
    });
  });

  it("normalizes imported mixed-language titles cleanly", () => {
    expect(
      normalizeVehicleLabels({
        make: "\uBCA4\uCE20",
        model: "E-\uD074\uB798\uC2A4 W213 E300 \uC544\uBC29\uAC00\uB974\uB4DC \uC778\uD154\uB9AC\uC804\uD2B8 \uB4DC\uB77C\uC774\uBE0C",
        title: "\uBCA4\uCE20 E-\uD074\uB798\uC2A4 W213 E300 \uC544\uBC29\uAC00\uB974\uB4DC \uC778\uD154\uB9AC\uC804\uD2B8 \uB4DC\uB77C\uC774\uBE0C",
      }),
    ).toMatchObject({
      displayMake: "Mercedes-Benz",
      displayModel: "E-Class W213 E300 Avantgarde Intelligent Drive",
      displayTitle: "Mercedes-Benz E-Class W213 E300 Avantgarde Intelligent Drive",
    });
  });
});

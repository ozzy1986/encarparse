import "dotenv/config";

import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { extractListingsFromPayload } from "../src/lib/encar/parser";
import { ENCAR_CATEGORIES } from "../src/lib/encar/types";

function parseCategoryId() {
  const categoryArg = process.argv.find((argument) => argument.startsWith("--category="));
  return categoryArg?.split("=")[1] ?? "imported";
}

function resolveLaunchOptions(headless: boolean) {
  const configuredExecutable = process.env.PLAYWRIGHT_EXECUTABLE_PATH?.trim();
  const knownWindowsEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const executablePath = [configuredExecutable, process.platform === "win32" ? knownWindowsEdgePath : undefined]
    .filter((candidate): candidate is string => Boolean(candidate))
    .find((candidate) => existsSync(candidate));

  return {
    headless,
    ...(executablePath ? { executablePath } : {}),
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  };
}

async function main() {
  const category = ENCAR_CATEGORIES.find((item) => item.id === parseCategoryId()) ?? ENCAR_CATEGORIES[1];
  const headless = !process.argv.includes("--headful");
  const browser = await chromium.launch(resolveLaunchOptions(headless));
  const context = await browser.newContext({
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
  });
  const page = await context.newPage();

  page.on("response", async (response) => {
    const contentType = response.headers()["content-type"] ?? "";
    if (!contentType.includes("json") && !/(search|list|result|api|ajax)/i.test(response.url())) {
      return;
    }

    try {
      const payload = contentType.includes("json") ? await response.json() : JSON.parse(await response.text());
      const listings = extractListingsFromPayload(payload, category.id);
      if (listings.length > 0) {
        console.info(`\n[inspect] ${response.status()} ${response.url()}`);
        console.info(`[inspect] extracted listings: ${listings.length}`);
        console.info(JSON.stringify(listings[0], null, 2));
      }
    } catch {
      // Ignore non-JSON responses.
    }
  });

  await page.goto(category.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(12_000);
  console.info(`[inspect] hash=${await page.evaluate(() => window.location.hash)}`);
  console.info(
    `[inspect] detail links=${await page.locator('a[href*="cardetailview.do"], a[href*="carid="]').count()}`,
  );

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

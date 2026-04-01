-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'encar',
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "category" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "makeDisplay" TEXT NOT NULL DEFAULT '',
    "modelDisplay" TEXT NOT NULL DEFAULT '',
    "titleDisplay" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL,
    "mileageKm" INTEGER NOT NULL,
    "priceKrw" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Car" ("category", "createdAt", "currency", "firstSeenAt", "id", "isActive", "lastSeenAt", "make", "mileageKm", "model", "photoUrl", "priceKrw", "raw", "source", "sourceId", "sourceUrl", "title", "updatedAt", "year") SELECT "category", "createdAt", "currency", "firstSeenAt", "id", "isActive", "lastSeenAt", "make", "mileageKm", "model", "photoUrl", "priceKrw", "raw", "source", "sourceId", "sourceUrl", "title", "updatedAt", "year" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE INDEX "Car_isActive_lastSeenAt_idx" ON "Car"("isActive", "lastSeenAt");
CREATE INDEX "Car_make_model_idx" ON "Car"("make", "model");
CREATE INDEX "Car_makeDisplay_modelDisplay_idx" ON "Car"("makeDisplay", "modelDisplay");
CREATE INDEX "Car_year_idx" ON "Car"("year");
CREATE INDEX "Car_priceKrw_idx" ON "Car"("priceKrw");
CREATE UNIQUE INDEX "Car_source_sourceId_key" ON "Car"("source", "sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

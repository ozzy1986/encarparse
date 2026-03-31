-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'encar',
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "category" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'encar',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "discoveredCount" INTEGER NOT NULL DEFAULT 0,
    "upsertedCount" INTEGER NOT NULL DEFAULT 0,
    "deactivatedCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Car_isActive_lastSeenAt_idx" ON "Car"("isActive", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Car_make_model_idx" ON "Car"("make", "model");

-- CreateIndex
CREATE INDEX "Car_year_idx" ON "Car"("year");

-- CreateIndex
CREATE INDEX "Car_priceKrw_idx" ON "Car"("priceKrw");

-- CreateIndex
CREATE UNIQUE INDEX "Car_source_sourceId_key" ON "Car"("source", "sourceId");

-- CreateIndex
CREATE INDEX "ScrapeRun_source_status_startedAt_idx" ON "ScrapeRun"("source", "status", "startedAt");

-- Add dynamic service-frequency support.
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'BI_WEEKLY';
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'MONTHLY';

-- Update singleton defaults requested for the editable pricing configuration.
ALTER TABLE "BusinessSettings"
  ALTER COLUMN "firstVisitCents" SET DEFAULT 9000,
  ALTER COLUMN "weeklyServiceCents" SET DEFAULT 1500,
  ALTER COLUMN "maxYardSize" SET DEFAULT '1 Acre';

UPDATE "BusinessSettings"
SET
  "firstVisitCents" = 9000,
  "weeklyServiceCents" = 1500,
  "maxYardSize" = '1 Acre',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'business'
  AND "firstVisitCents" = 10000
  AND "weeklyServiceCents" = 2500
  AND "maxYardSize" = '1/4 acre';

CREATE TABLE "ServiceFrequency" (
  "id" VARCHAR(40) NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "basePriceCents" INTEGER NOT NULL,
  "serviceType" VARCHAR(40) NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceFrequency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceFrequency_sortOrder_key" ON "ServiceFrequency"("sortOrder");

CREATE TABLE "YardSizeOption" (
  "id" VARCHAR(40) NOT NULL,
  "slot" INTEGER NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "extraFeeCents" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "YardSizeOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "YardSizeOption_slot_key" ON "YardSizeOption"("slot");

INSERT INTO "ServiceFrequency" (
  "id",
  "name",
  "basePriceCents",
  "serviceType",
  "sortOrder"
) VALUES
  ('first-visit', 'First Visit', 9000, 'ONE_TIME', 1),
  ('weekly', 'Weekly Service', 1500, 'WEEKLY', 2),
  ('bi-weekly', 'Bi-Weekly Service', 2500, 'BI_WEEKLY', 3),
  ('monthly', 'Monthly Service', 5000, 'MONTHLY', 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "YardSizeOption" (
  "id",
  "slot",
  "name",
  "extraFeeCents"
) VALUES
  ('slot-1', 1, '1/16 Acre', 0),
  ('slot-2', 2, '1/8 Acre', 500),
  ('slot-3', 3, '1/4 Acre', 1000),
  ('slot-4', 4, '1/2 Acre', 2500),
  ('slot-5', 5, '1 Acre', 5500)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "Lead"
  ADD COLUMN "serviceFrequencyId" VARCHAR(40),
  ADD COLUMN "yardSizeOptionId" VARCHAR(40),
  ADD COLUMN "calculatedTotalCents" INTEGER;

UPDATE "Lead"
SET "serviceFrequencyId" = CASE
  WHEN "serviceType" = 'ONE_TIME' THEN 'first-visit'
  ELSE 'weekly'
END
WHERE "serviceFrequencyId" IS NULL;

UPDATE "Lead"
SET "yardSizeOptionId" = CASE
  WHEN "yardSize" = 'UNDER_QUARTER' THEN 'slot-2'
  WHEN "yardSize" = 'EXACT_QUARTER' THEN 'slot-3'
  ELSE 'slot-5'
END
WHERE "yardSizeOptionId" IS NULL;

CREATE INDEX "Lead_serviceFrequencyId_idx" ON "Lead"("serviceFrequencyId");
CREATE INDEX "Lead_yardSizeOptionId_idx" ON "Lead"("yardSizeOptionId");

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_serviceFrequencyId_fkey"
  FOREIGN KEY ("serviceFrequencyId") REFERENCES "ServiceFrequency"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_yardSizeOptionId_fkey"
  FOREIGN KEY ("yardSizeOptionId") REFERENCES "YardSizeOption"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

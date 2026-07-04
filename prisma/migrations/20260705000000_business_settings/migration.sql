-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL DEFAULT 'business',
    "firstVisitCents" INTEGER NOT NULL DEFAULT 10000,
    "weeklyServiceCents" INTEGER NOT NULL DEFAULT 2500,
    "extraDogCents" INTEGER NOT NULL DEFAULT 500,
    "serviceArea" VARCHAR(120) NOT NULL DEFAULT 'Loudoun County, VA',
    "maxYardSize" VARCHAR(80) NOT NULL DEFAULT '1/4 acre',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton settings row used by the admin settings page.
INSERT INTO "BusinessSettings" (
    "id",
    "firstVisitCents",
    "weeklyServiceCents",
    "extraDogCents",
    "serviceArea",
    "maxYardSize",
    "updatedAt"
) VALUES (
    'business',
    10000,
    2500,
    500,
    'Loudoun County, VA',
    '1/4 acre',
    CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

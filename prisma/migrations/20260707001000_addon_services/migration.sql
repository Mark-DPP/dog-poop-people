CREATE TABLE "AddonService" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "price" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AddonService_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AddonService_isActive_createdAt_idx"
  ON "AddonService"("isActive", "createdAt");

ALTER TABLE "Lead"
  ADD COLUMN "selectedAddonIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "selectedAddons" JSONB;

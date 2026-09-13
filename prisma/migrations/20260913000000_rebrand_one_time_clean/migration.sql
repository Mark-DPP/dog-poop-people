UPDATE "ServiceFrequency"
SET
  "name" = 'One-Time Clean',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "serviceType" = 'ONE_TIME';

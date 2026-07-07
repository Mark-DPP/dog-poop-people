export type BusinessSettingsValues = {
  extraDogCents: number;
  serviceArea: string;
  maxYardSize: string;
  serviceFrequencies: ServiceFrequencyConfig[];
  yardSizeOptions: YardSizeConfig[];
  addonServices: AddonServiceConfig[];
};

export type ServiceFrequencyConfig = {
  id: string;
  name: string;
  basePriceCents: number;
  serviceType: string;
  sortOrder: number;
};

export type YardSizeConfig = {
  id: string;
  slot: number;
  name: string;
  extraFeeCents: number;
};

export type AddonServiceConfig = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
};

export const defaultBusinessSettings: BusinessSettingsValues = {
  extraDogCents: 500,
  serviceArea: "Loudoun County, VA",
  maxYardSize: "1 Acre",
  serviceFrequencies: [
    {
      id: "first-visit",
      name: "First Visit",
      basePriceCents: 9000,
      serviceType: "ONE_TIME",
      sortOrder: 1,
    },
    {
      id: "weekly",
      name: "Weekly Service",
      basePriceCents: 1500,
      serviceType: "WEEKLY",
      sortOrder: 2,
    },
    {
      id: "bi-weekly",
      name: "Bi-Weekly Service",
      basePriceCents: 2500,
      serviceType: "BI_WEEKLY",
      sortOrder: 3,
    },
    {
      id: "monthly",
      name: "Monthly Service",
      basePriceCents: 5000,
      serviceType: "MONTHLY",
      sortOrder: 4,
    },
  ],
  yardSizeOptions: [
    { id: "slot-1", slot: 1, name: "1/16 Acre", extraFeeCents: 0 },
    { id: "slot-2", slot: 2, name: "1/8 Acre", extraFeeCents: 500 },
    { id: "slot-3", slot: 3, name: "1/4 Acre", extraFeeCents: 1000 },
    { id: "slot-4", slot: 4, name: "1/2 Acre", extraFeeCents: 2500 },
    { id: "slot-5", slot: 5, name: "1 Acre", extraFeeCents: 5500 },
  ],
  addonServices: [],
};

export function calculatePriceCents({
  basePriceCents,
  yardExtraFeeCents,
  numberOfDogs,
  addonTotalCents = 0,
  extraDogCents = defaultBusinessSettings.extraDogCents,
}: {
  basePriceCents: number;
  yardExtraFeeCents: number;
  numberOfDogs: number;
  addonTotalCents?: number;
  extraDogCents?: number;
}) {
  const additionalDogs = Math.max(numberOfDogs - 1, 0);

  return (
    basePriceCents +
    yardExtraFeeCents +
    additionalDogs * extraDogCents +
    addonTotalCents
  );
}

export function formatCurrency(cents: number) {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
  }).format(dollars);
}

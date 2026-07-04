export type BusinessSettingsValues = {
  firstVisitCents: number;
  weeklyServiceCents: number;
  extraDogCents: number;
  serviceArea: string;
  maxYardSize: string;
};

export const defaultBusinessSettings: BusinessSettingsValues = {
  firstVisitCents: 10000,
  weeklyServiceCents: 2500,
  extraDogCents: 500,
  serviceArea: "Loudoun County, VA",
  maxYardSize: "1/4 acre",
};

export function formatCurrency(cents: number) {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
  }).format(dollars);
}

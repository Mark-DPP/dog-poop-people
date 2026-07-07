import "server-only";

import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  defaultBusinessSettings,
  type ServiceFrequencyConfig,
  type BusinessSettingsValues,
  type YardSizeConfig,
} from "@/lib/settings/pricing";

const settingsId = "business";

export async function getBusinessSettings(): Promise<BusinessSettingsValues> {
  await connection();

  try {
    const [settings, serviceFrequencies, yardSizeOptions, addonServices] =
      await Promise.all([
      prisma.businessSettings.findUnique({
        where: { id: settingsId },
      }),
      prisma.serviceFrequency.findMany({
        orderBy: { sortOrder: "asc" },
      }),
      prisma.yardSizeOption.findMany({
        orderBy: { slot: "asc" },
      }),
      prisma.addonService.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const frequencies =
      serviceFrequencies.length > 0
        ? serviceFrequencies.map((frequency) => ({
            id: frequency.id,
            name: frequency.name,
            basePriceCents: frequency.basePriceCents,
            serviceType: frequency.serviceType,
            sortOrder: frequency.sortOrder,
          }))
        : defaultBusinessSettings.serviceFrequencies;

    const yardSizes =
      yardSizeOptions.length > 0
        ? yardSizeOptions.map((option) => ({
            id: option.id,
            slot: option.slot,
            name: option.name,
            extraFeeCents: option.extraFeeCents,
          }))
        : defaultBusinessSettings.yardSizeOptions;

    if (!settings) {
      return {
        ...defaultBusinessSettings,
        serviceFrequencies: frequencies,
        yardSizeOptions: yardSizes,
        addonServices,
      };
    }

    return {
      extraDogCents: settings.extraDogCents,
      serviceArea: settings.serviceArea,
      maxYardSize: settings.maxYardSize,
      serviceFrequencies: frequencies,
      yardSizeOptions: yardSizes,
      addonServices,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2021"
    ) {
      return defaultBusinessSettings;
    }

    throw error;
  }
}

export async function saveBusinessSettings(values: BusinessSettingsValues) {
  try {
    const {
      addonServices,
      serviceFrequencies,
      yardSizeOptions,
      ...businessSettings
    } = values;
    void addonServices;

    return await prisma.$transaction(async (tx) => {
      const settings = await tx.businessSettings.upsert({
        where: { id: settingsId },
        create: {
          id: settingsId,
          firstVisitCents:
            serviceFrequencies.find((item) => item.id === "first-visit")
              ?.basePriceCents ?? defaultBusinessSettings.serviceFrequencies[0].basePriceCents,
          weeklyServiceCents:
            serviceFrequencies.find((item) => item.id === "weekly")
              ?.basePriceCents ?? defaultBusinessSettings.serviceFrequencies[1].basePriceCents,
          ...businessSettings,
        },
        update: {
          firstVisitCents:
            serviceFrequencies.find((item) => item.id === "first-visit")
              ?.basePriceCents ?? defaultBusinessSettings.serviceFrequencies[0].basePriceCents,
          weeklyServiceCents:
            serviceFrequencies.find((item) => item.id === "weekly")
              ?.basePriceCents ?? defaultBusinessSettings.serviceFrequencies[1].basePriceCents,
          ...businessSettings,
        },
      });

      await Promise.all([
        ...serviceFrequencies.map((frequency) =>
          tx.serviceFrequency.upsert({
            where: { id: frequency.id },
            create: frequency,
            update: {
              name: frequency.name,
              basePriceCents: frequency.basePriceCents,
              serviceType: frequency.serviceType,
              sortOrder: frequency.sortOrder,
            },
          }),
        ),
        ...yardSizeOptions.map((option) =>
          tx.yardSizeOption.upsert({
            where: { id: option.id },
            create: option,
            update: {
              slot: option.slot,
              name: option.name,
              extraFeeCents: option.extraFeeCents,
            },
          }),
        ),
      ]);

      return settings;
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2021"
    ) {
      throw new Error(
        "Business settings table is missing. Run the latest Prisma migration before saving settings.",
      );
    }

    throw error;
  }
}

export function getDefaultServiceFrequency(id: string): ServiceFrequencyConfig | undefined {
  return defaultBusinessSettings.serviceFrequencies.find((item) => item.id === id);
}

export function getDefaultYardSizeOption(id: string): YardSizeConfig | undefined {
  return defaultBusinessSettings.yardSizeOptions.find((item) => item.id === id);
}

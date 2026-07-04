import "server-only";

import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  defaultBusinessSettings,
  type BusinessSettingsValues,
} from "@/lib/settings/pricing";

const settingsId = "business";

export async function getBusinessSettings(): Promise<BusinessSettingsValues> {
  await connection();

  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: settingsId },
    });

    if (!settings) {
      return defaultBusinessSettings;
    }

    return {
      firstVisitCents: settings.firstVisitCents,
      weeklyServiceCents: settings.weeklyServiceCents,
      extraDogCents: settings.extraDogCents,
      serviceArea: settings.serviceArea,
      maxYardSize: settings.maxYardSize,
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
    return await prisma.businessSettings.upsert({
      where: { id: settingsId },
      create: {
        id: settingsId,
        ...values,
      },
      update: values,
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

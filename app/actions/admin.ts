"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { saveBusinessSettings } from "@/lib/settings/business-settings";
import { defaultBusinessSettings } from "@/lib/settings/pricing";

const leadStatusSchema = z.enum([
  "NEW_LEAD",
  "CONTACTED",
  "SCHEDULED",
  "COMPLETED",
  "CLOSED",
  "NOT_QUALIFIED",
]);

const contactMessageStatusSchema = z.enum(["UNREAD", "READ", "ARCHIVED"]);

const moneySchema = z
  .string()
  .trim()
  .regex(/^\$?\d+(\.\d{1,2})?$/, "Enter a valid price.")
  .transform((value) => Math.round(Number(value.replace("$", "")) * 100))
  .refine((value) => value >= 0 && value <= 100000, "Enter a price under $1,000.");

const businessSettingsSchema = z.object({
  serviceFrequencies: z.array(
    z.object({
      id: z.string().min(1).max(40),
      name: z.string().min(1).max(80),
      basePriceCents: z.number().int().min(0).max(100000),
      serviceType: z.string().min(1).max(40),
      sortOrder: z.number().int().min(1).max(10),
    }),
  ),
  yardSizeOptions: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        slot: z.number().int().min(1).max(5),
        name: z
          .string()
          .trim()
          .min(1, "Enter a yard size name.")
          .max(80, "Keep yard size names under 80 characters."),
        extraFeeCents: z.number().int().min(0).max(100000),
      }),
    )
    .length(5, "Exactly five yard size slots are required."),
  serviceArea: z
    .string()
    .trim()
    .min(2, "Enter a service area.")
    .max(120, "Keep the service area under 120 characters."),
  maxYardSize: z
    .string()
    .trim()
    .min(2, "Enter a max yard size.")
    .max(80, "Keep the max yard size under 80 characters."),
});

const addonServiceSchema = z.object({
  id: z.string().trim().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Enter a service name.")
    .max(120, "Keep service names under 120 characters."),
  price: z.number().int().min(0).max(100000),
});

export type AdminActionState = {
  ok: boolean;
  message: string;
};

const defaultState: AdminActionState = {
  ok: false,
  message: "",
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getMoneyCents(formData: FormData, key: string) {
  const parsedValue = moneySchema.safeParse(getString(formData, key));

  return parsedValue.success ? parsedValue.data : Number.NaN;
}

function revalidatePricingPaths() {
  revalidatePath("/admin/settings");
  revalidatePath("/customer-qualification");
  revalidatePath("/");
}

export async function updateLeadAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/dashboard");

  const id = getString(formData, "id");
  const status = leadStatusSchema.safeParse(getString(formData, "status"));
  const adminNotes = getString(formData, "adminNotes").trim();

  if (!id || !status.success) {
    return {
      ok: false,
      message: "Please choose a valid status.",
    };
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status: status.data,
      adminNotes: adminNotes || null,
    },
  });

  await prisma.adminActivity.create({
    data: {
      type: "LEAD_STATUS_UPDATED",
      title: "Lead status updated",
      description: `${lead.fullName} marked as ${status.data.replaceAll("_", " ").toLowerCase()}.`,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/reports");

  return {
    ok: true,
    message: "Lead updated successfully.",
  };
}

export async function deleteLeadAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/leads");

  const id = getString(formData, "id");

  if (!id) {
    return {
      ok: false,
      message: "Lead could not be found.",
    };
  }

  const lead = await prisma.lead.delete({
    where: { id },
  });

  await prisma.adminActivity.create({
    data: {
      type: "LEAD_DELETED",
      title: "Lead deleted",
      description: `${lead.fullName} was permanently deleted.`,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/reports");

  redirect("/admin/dashboard");
}

export async function updateContactMessageStatusAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/messages");

  const id = getString(formData, "id");
  const status = contactMessageStatusSchema.safeParse(getString(formData, "status"));

  if (!id || !status.success) {
    return {
      ok: false,
      message: "Please choose a valid message status.",
    };
  }

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status: status.data },
  });

  await prisma.adminActivity.create({
    data: {
      type: "CONTACT_MESSAGE_STATUS_UPDATED",
      title: "Contact message updated",
      description: `${message.fullName}'s message marked as ${status.data.toLowerCase()}.`,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/reports");

  return {
    ok: true,
    message: "Message updated successfully.",
  };
}

export async function updateBusinessSettingsAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/settings");

  const settings = businessSettingsSchema.safeParse({
    serviceFrequencies: defaultBusinessSettings.serviceFrequencies.map(
      (frequency) => ({
        ...frequency,
        basePriceCents: getMoneyCents(formData, `serviceFrequency:${frequency.id}`),
      }),
    ),
    yardSizeOptions: defaultBusinessSettings.yardSizeOptions.map((option) => ({
      id: option.id,
      slot: option.slot,
      name: getString(formData, `yardSizeName:${option.slot}`),
      extraFeeCents: getMoneyCents(formData, `yardSizeFee:${option.slot}`),
    })),
    serviceArea: getString(formData, "serviceArea"),
    maxYardSize: getString(formData, "maxYardSize"),
  });

  if (!settings.success) {
    const error = settings.error.issues[0]?.message ?? "Please check the settings.";

    return {
      ok: false,
      message: error,
    };
  }

  try {
    await saveBusinessSettings({
      extraDogCents: defaultBusinessSettings.extraDogCents,
      serviceArea: settings.data.serviceArea,
      maxYardSize: settings.data.maxYardSize,
      serviceFrequencies: settings.data.serviceFrequencies,
      yardSizeOptions: settings.data.yardSizeOptions,
      addonServices: [],
    });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Settings could not be saved. Please try again.",
    };
  }

  await prisma.adminActivity.create({
    data: {
      type: "BUSINESS_SETTINGS_UPDATED",
      title: "Business settings updated",
      description: "Pricing and qualification rules were updated.",
    },
  });

  revalidatePricingPaths();

  return {
    ok: true,
    message: "Settings saved successfully.",
  };
}

export async function saveAddonServiceAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/settings");

  const addon = addonServiceSchema.safeParse({
    id: getString(formData, "id") || undefined,
    name: getString(formData, "name"),
    price: getMoneyCents(formData, "price"),
  });

  if (!addon.success) {
    return {
      ok: false,
      message: addon.error.issues[0]?.message ?? "Please check the add-on.",
    };
  }

  const savedAddon = addon.data.id
    ? await prisma.addonService.update({
        where: { id: addon.data.id },
        data: {
          name: addon.data.name,
          price: addon.data.price,
        },
      })
    : await prisma.addonService.create({
        data: {
          name: addon.data.name,
          price: addon.data.price,
          isActive: true,
        },
      });

  await prisma.adminActivity.create({
    data: {
      type: addon.data.id ? "ADDON_SERVICE_UPDATED" : "ADDON_SERVICE_CREATED",
      title: addon.data.id ? "Add-on service updated" : "Add-on service created",
      description: `${savedAddon.name} was saved.`,
    },
  });

  revalidatePricingPaths();

  return {
    ok: true,
    message: "Add-on service saved successfully.",
  };
}

export async function toggleAddonServiceAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/settings");

  const id = getString(formData, "id");

  if (!id) {
    return {
      ok: false,
      message: "Add-on service could not be found.",
    };
  }

  const addon = await prisma.addonService.update({
    where: { id },
    data: {
      isActive: getString(formData, "isActive") === "on",
    },
  });

  await prisma.adminActivity.create({
    data: {
      type: "ADDON_SERVICE_TOGGLED",
      title: "Add-on service updated",
      description: `${addon.name} was ${addon.isActive ? "enabled" : "disabled"}.`,
    },
  });

  revalidatePricingPaths();

  return {
    ok: true,
    message: "Add-on service updated.",
  };
}

export async function deleteAddonServiceAction(
  prevState: AdminActionState = defaultState,
  formData: FormData,
): Promise<AdminActionState> {
  void prevState;
  await requireAdminUser("/admin/settings");

  const id = getString(formData, "id");

  if (!id) {
    return {
      ok: false,
      message: "Add-on service could not be found.",
    };
  }

  const addon = await prisma.addonService.delete({
    where: { id },
  });

  await prisma.adminActivity.create({
    data: {
      type: "ADDON_SERVICE_DELETED",
      title: "Add-on service deleted",
      description: `${addon.name} was deleted.`,
    },
  });

  revalidatePricingPaths();

  return {
    ok: true,
    message: "Add-on service deleted.",
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { sendLeadStatusCustomerEmail } from "@/lib/email/notifications";
import { saveBusinessSettings } from "@/lib/settings/business-settings";

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
  firstVisit: moneySchema,
  weeklyService: moneySchema,
  extraDog: moneySchema,
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

  let emailMessage = " Customer email sent.";

  try {
    await sendLeadStatusCustomerEmail({ lead });
  } catch {
    emailMessage =
      " Customer email could not be sent. Check Resend environment variables and logs.";
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/reports");

  return {
    ok: true,
    message: `Lead updated successfully.${emailMessage}`,
  };
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
    firstVisit: getString(formData, "firstVisit"),
    weeklyService: getString(formData, "weeklyService"),
    extraDog: getString(formData, "extraDog"),
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
      firstVisitCents: settings.data.firstVisit,
      weeklyServiceCents: settings.data.weeklyService,
      extraDogCents: settings.data.extraDog,
      serviceArea: settings.data.serviceArea,
      maxYardSize: settings.data.maxYardSize,
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

  revalidatePath("/admin/settings");
  revalidatePath("/customer-qualification");
  revalidatePath("/");

  return {
    ok: true,
    message: "Settings saved successfully.",
  };
}

"use server";

import { prisma } from "@/lib/db/prisma";
import {
  assertEmailNotificationsConfigured,
  sendContactNotificationEmail,
  sendLeadNotificationEmail,
} from "@/lib/email/notifications";
import {
  YARD_SIZE_UNKNOWN,
  contactSchema,
  propertyAreaLabels,
  serviceRequestSchema,
  type ContactFormValues,
  type PropertyArea,
  type ServiceRequestFormValues,
} from "@/lib/forms";
import type { ServiceType, YardSize } from "@/lib/generated/prisma/enums";
import { calculatePriceCents } from "@/lib/settings/pricing";

type SubmissionResult = {
  ok: boolean;
  message: string;
};

const MIN_SUBMIT_TIME_MS = 1500;

function isTooFast(formStartedAt?: number) {
  if (!formStartedAt) {
    return true;
  }

  return Date.now() - formStartedAt < MIN_SUBMIT_TIME_MS;
}

function toOptionalString(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function toDogCount(value: ServiceRequestFormValues["dogs"]) {
  return value === "5+" ? 5 : Number(value);
}

function toServiceType(value: string): ServiceType {
  const serviceTypes = ["ONE_TIME", "WEEKLY", "BI_WEEKLY", "MONTHLY"] as const;

  if (serviceTypes.includes(value as ServiceType)) {
    return value as ServiceType;
  }

  return "WEEKLY";
}

function toLegacyYardSize(name: string): YardSize {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("1/16") || normalizedName.includes("1/8")) {
    return "UNDER_QUARTER";
  }

  if (normalizedName.includes("1/4")) {
    return "EXACT_QUARTER";
  }

  return "OVER_QUARTER";
}

function getClientErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("Missing:")) {
    return error.message;
  }

  return "Something went wrong while sending your submission. Please try again.";
}

export async function submitLeadForm(
  input: ServiceRequestFormValues,
): Promise<SubmissionResult> {
  const parsedInput = serviceRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
    };
  }

  const lead = parsedInput.data;

  if (lead.website) {
    return {
      ok: true,
      message: "Thank you. Your request has been received.",
    };
  }

  if (isTooFast(lead.formStartedAt)) {
    return {
      ok: false,
      message: "Please wait a moment before submitting the form.",
    };
  }

  const submittedAt = new Date();
  const yardUnknown = lead.yardSize === YARD_SIZE_UNKNOWN;

  try {
    assertEmailNotificationsConfigured();

    const createdLead = await prisma.$transaction(async (tx) => {
      const [oneTimeFrequency, settings] = await Promise.all([
        tx.serviceFrequency.findFirst({
          where: { serviceType: "ONE_TIME" },
          orderBy: { sortOrder: "asc" },
        }),
        tx.businessSettings.findUnique({
          where: { id: "business" },
        }),
      ]);

      if (!oneTimeFrequency) {
        throw new Error("Service pricing is not configured. Please try again later.");
      }

      // Recurring is the default flow; the one-time checkbox uses the initial
      // clean (reset) fee only.
      const recurringFrequency = lead.oneTimeClean
        ? null
        : await tx.serviceFrequency.findUnique({
            where: { id: lead.serviceType },
          });

      if (!lead.oneTimeClean && !recurringFrequency) {
        throw new Error("Please choose a valid recurring service.");
      }

      const linkedFrequency = lead.oneTimeClean
        ? oneTimeFrequency
        : (recurringFrequency as NonNullable<typeof recurringFrequency>);

      const yardSizeOption = yardUnknown
        ? null
        : await tx.yardSizeOption.findUnique({
            where: { id: lead.yardSize },
          });

      if (!yardUnknown && !yardSizeOption) {
        throw new Error("Please choose a valid yard size.");
      }

      const numberOfDogs = toDogCount(lead.dogs);
      const selectedAddonIds = lead.addonServiceIds ?? [];
      const selectedAddons =
        selectedAddonIds.length > 0
          ? await tx.addonService.findMany({
              where: {
                id: { in: selectedAddonIds },
                isActive: true,
              },
              orderBy: { createdAt: "asc" },
            })
          : [];
      const selectedAddonSnapshot = selectedAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
      }));
      const addonTotalCents = selectedAddonSnapshot.reduce(
        (total, addon) => total + addon.price,
        0,
      );

      // Recurring quotes bundle the initial clean fee with the recurring price;
      // one-time quotes use only the reset fee.
      const serviceBaseCents = lead.oneTimeClean
        ? oneTimeFrequency.basePriceCents
        : oneTimeFrequency.basePriceCents +
          (recurringFrequency?.basePriceCents ?? 0);

      // No final total is calculated when the yard size is unknown.
      const calculatedTotalCents =
        yardUnknown || !yardSizeOption
          ? null
          : calculatePriceCents({
              basePriceCents: serviceBaseCents,
              yardExtraFeeCents: yardSizeOption.extraFeeCents,
              numberOfDogs,
              addonTotalCents,
              extraDogCents: settings?.extraDogCents,
            });

      const propertyAddress = [
        lead.street,
        lead.city,
        `${lead.state} ${lead.zip}`.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const propertyArea = lead.propertyArea as PropertyArea;

      const savedLead = await tx.lead.create({
        data: {
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          propertyAddress,
          street: lead.street,
          city: lead.city,
          state: lead.state,
          zipCode: lead.zip,
          serviceType: toServiceType(linkedFrequency.serviceType),
          serviceFrequencyId: linkedFrequency.id,
          isOneTimeClean: lead.oneTimeClean,
          numberOfDogs,
          yardSize: yardSizeOption ? toLegacyYardSize(yardSizeOption.name) : null,
          yardSizeOptionId: yardSizeOption?.id ?? null,
          yardSizeUnknown: yardUnknown,
          propertyArea,
          propertyAreaDetail:
            propertyArea === "SPECIFIC_AREA"
              ? toOptionalString(lead.propertyAreaDetail)
              : null,
          selectedAddonIds: selectedAddonSnapshot.map((addon) => addon.id),
          selectedAddons: selectedAddonSnapshot,
          calculatedTotalCents,
          accessNotes: toOptionalString(lead.accessNotes),
          message: toOptionalString(lead.message),
          status: "NEW_LEAD",
        },
      });

      const serviceLabel = lead.oneTimeClean
        ? "One-Time Clean"
        : linkedFrequency.name;

      await tx.adminActivity.create({
        data: {
          type: "LEAD_CREATED",
          title: "New service request received",
          description: `${lead.fullName} submitted a ${serviceLabel} request.`,
        },
      });

      return {
        lead: savedLead,
        serviceLabel,
        propertyAddress,
        propertyArea,
        isOneTimeClean: lead.oneTimeClean,
        initialCleanCents: oneTimeFrequency.basePriceCents,
        recurringLabel: recurringFrequency?.name ?? null,
        recurringCents: recurringFrequency?.basePriceCents ?? null,
        numberOfDogs,
        yardSizeLabel: yardUnknown
          ? "Unsure — to verify"
          : (yardSizeOption?.name ?? "—"),
        yardSizeUnknown: yardUnknown,
        selectedAddons: selectedAddonSnapshot,
        calculatedTotalCents,
      };
    });

    await sendLeadNotificationEmail({
      lead,
      submittedAt: createdLead.lead.createdAt ?? submittedAt,
      serviceLabel: createdLead.serviceLabel,
      propertyAddress: createdLead.propertyAddress,
      isOneTimeClean: createdLead.isOneTimeClean,
      initialCleanCents: createdLead.initialCleanCents,
      recurringLabel: createdLead.recurringLabel,
      recurringCents: createdLead.recurringCents,
      numberOfDogs: createdLead.numberOfDogs,
      yardSizeLabel: createdLead.yardSizeLabel,
      yardSizeUnknown: createdLead.yardSizeUnknown,
      propertyAreaLabel: propertyAreaLabels[createdLead.propertyArea],
      propertyAreaDetail:
        createdLead.propertyArea === "SPECIFIC_AREA"
          ? toOptionalString(lead.propertyAreaDetail)
          : null,
      selectedAddons: createdLead.selectedAddons,
      calculatedTotalCents: createdLead.calculatedTotalCents,
    });

    return {
      ok: true,
      message: "Thank you. Your request has been received.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getClientErrorMessage(error),
    };
  }
}

export async function submitContactForm(
  input: ContactFormValues,
): Promise<SubmissionResult> {
  const parsedInput = contactSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
    };
  }

  const contactMessage = parsedInput.data;

  if (contactMessage.website) {
    return {
      ok: true,
      message: "Thanks for reaching out.",
    };
  }

  if (isTooFast(contactMessage.formStartedAt)) {
    return {
      ok: false,
      message: "Please wait a moment before submitting the form.",
    };
  }

  const submittedAt = new Date();

  try {
    assertEmailNotificationsConfigured();

    const createdContactMessage = await prisma.$transaction(async (tx) => {
      const savedMessage = await tx.contactMessage.create({
        data: {
          fullName: contactMessage.fullName,
          email: contactMessage.email,
          phone: toOptionalString(contactMessage.phone),
          message: contactMessage.message,
          status: "UNREAD",
        },
      });

      await tx.adminActivity.create({
        data: {
          type: "CONTACT_MESSAGE_CREATED",
          title: "New contact message received",
          description: `${contactMessage.fullName} sent a contact message.`,
        },
      });

      return savedMessage;
    });

    await sendContactNotificationEmail({
      message: contactMessage,
      submittedAt: createdContactMessage.createdAt ?? submittedAt,
    });

    return {
      ok: true,
      message: "Thanks for reaching out.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getClientErrorMessage(error),
    };
  }
}

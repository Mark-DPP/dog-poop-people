"use server";

import { prisma } from "@/lib/db/prisma";
import {
  assertEmailNotificationsConfigured,
  sendContactAutoReplyEmail,
  sendContactNotificationEmail,
  sendLeadReceivedCustomerEmail,
  sendLeadNotificationEmail,
} from "@/lib/email/notifications";
import {
  contactSchema,
  serviceRequestSchema,
  type ContactFormValues,
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

  try {
    assertEmailNotificationsConfigured();

    const createdLead = await prisma.$transaction(async (tx) => {
      const [serviceFrequency, yardSizeOption, settings] = await Promise.all([
        tx.serviceFrequency.findUnique({
          where: { id: lead.serviceType },
        }),
        tx.yardSizeOption.findUnique({
          where: { id: lead.yardSize },
        }),
        tx.businessSettings.findUnique({
          where: { id: "business" },
        }),
      ]);

      if (!serviceFrequency || !yardSizeOption) {
        throw new Error("Please choose a valid service frequency and yard size.");
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
      const calculatedTotalCents = calculatePriceCents({
        basePriceCents: serviceFrequency.basePriceCents,
        yardExtraFeeCents: yardSizeOption.extraFeeCents,
        numberOfDogs,
        addonTotalCents,
        extraDogCents: settings?.extraDogCents,
      });

      const savedLead = await tx.lead.create({
        data: {
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          propertyAddress: lead.address,
          serviceType: toServiceType(serviceFrequency.serviceType),
          serviceFrequencyId: serviceFrequency.id,
          numberOfDogs,
          yardSize: toLegacyYardSize(yardSizeOption.name),
          yardSizeOptionId: yardSizeOption.id,
          selectedAddonIds: selectedAddonSnapshot.map((addon) => addon.id),
          selectedAddons: selectedAddonSnapshot,
          calculatedTotalCents,
          isInLoudounCounty: lead.loudounCounty,
          accessNotes: toOptionalString(lead.accessNotes),
          message: toOptionalString(lead.message),
          status: "NEW_LEAD",
        },
      });

      await tx.adminActivity.create({
        data: {
          type: "LEAD_CREATED",
          title: "New service request received",
          description: `${lead.fullName} submitted a ${serviceFrequency.name} request.`,
        },
      });

      return {
        lead: savedLead,
        serviceLabel: serviceFrequency.name,
        yardSizeLabel: yardSizeOption.name,
        selectedAddons: selectedAddonSnapshot,
        calculatedTotalCents,
      };
    });

    await sendLeadNotificationEmail({
      lead,
      submittedAt: createdLead.lead.createdAt ?? submittedAt,
      serviceLabel: createdLead.serviceLabel,
      yardSizeLabel: createdLead.yardSizeLabel,
      selectedAddons: createdLead.selectedAddons,
      calculatedTotalCents: createdLead.calculatedTotalCents,
    });
    await sendLeadReceivedCustomerEmail({
      lead,
      submittedAt: createdLead.lead.createdAt ?? submittedAt,
      serviceLabel: createdLead.serviceLabel,
      yardSizeLabel: createdLead.yardSizeLabel,
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
    await sendContactAutoReplyEmail({
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

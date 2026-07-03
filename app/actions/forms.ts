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

function toServiceType(value: ServiceRequestFormValues["serviceType"]) {
  return value === "one-time" ? "ONE_TIME" : "WEEKLY";
}

function toYardSize(value: ServiceRequestFormValues["yardSize"]) {
  const yardSizes = {
    "under-quarter": "UNDER_QUARTER",
    "exact-quarter": "EXACT_QUARTER",
    "over-quarter": "OVER_QUARTER",
  } as const;

  return yardSizes[value];
}

function toDogCount(value: ServiceRequestFormValues["dogs"]) {
  return value === "5+" ? 5 : Number(value);
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
      const savedLead = await tx.lead.create({
        data: {
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          propertyAddress: lead.address,
          serviceType: toServiceType(lead.serviceType),
          numberOfDogs: toDogCount(lead.dogs),
          yardSize: toYardSize(lead.yardSize),
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
          description: `${lead.fullName} submitted a ${lead.serviceType} request.`,
        },
      });

      return savedLead;
    });

    await sendLeadNotificationEmail({
      lead,
      submittedAt: createdLead.createdAt ?? submittedAt,
    });
    await sendLeadReceivedCustomerEmail({
      lead,
      submittedAt: createdLead.createdAt ?? submittedAt,
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

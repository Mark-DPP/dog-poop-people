import "server-only";

import { Resend } from "resend";

import type {
  ContactFormValues,
  ServiceRequestFormValues,
} from "@/lib/forms";

type NotificationConfig = {
  resendApiKey: string;
  adminEmail: string;
  fromEmail: string;
};

function getNotificationConfig(): NotificationConfig {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  const missingKeys = [
    !resendApiKey ? "RESEND_API_KEY" : null,
    !adminEmail ? "ADMIN_NOTIFICATION_EMAIL" : null,
    !fromEmail ? "RESEND_FROM_EMAIL" : null,
  ].filter(Boolean);

  if (missingKeys.length > 0) {
    throw new Error(
      `Email notifications are not configured. Missing: ${missingKeys.join(", ")}.`,
    );
  }

  return {
    resendApiKey: resendApiKey as string,
    adminEmail: adminEmail as string,
    fromEmail: fromEmail as string,
  };
}

export function assertEmailNotificationsConfigured() {
  getNotificationConfig();
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatOptional(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : "Not provided";
}

function formatSubmittedDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  }).format(date);
}

function serviceTypeLabel(serviceType: ServiceRequestFormValues["serviceType"]) {
  return serviceType === "one-time" ? "One Time Service" : "Weekly Service";
}

function yardSizeLabel(yardSize: ServiceRequestFormValues["yardSize"]) {
  const labels = {
    "under-quarter": "Under 1/4 acre",
    "exact-quarter": "Exactly 1/4 acre",
    "over-quarter": "Over 1/4 acre",
  } satisfies Record<ServiceRequestFormValues["yardSize"], string>;

  return labels[yardSize];
}

function renderTable(rows: Array<[string, string]>) {
  return `
    <table style="border-collapse:collapse;width:100%;max-width:680px">
      <tbody>
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <th style="border:1px solid #d7e4d3;padding:10px;text-align:left;background:#f4f8ef;width:210px">${escapeHtml(label)}</th>
                <td style="border:1px solid #d7e4d3;padding:10px;white-space:pre-wrap">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function sendNotificationEmail({
  subject,
  rows,
}: {
  subject: string;
  rows: Array<[string, string]>;
}) {
  const { resendApiKey, adminEmail, fromEmail } = getNotificationConfig();
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;color:#12321c;line-height:1.5">
        <h1 style="margin:0 0 16px">${escapeHtml(subject)}</h1>
        ${renderTable(rows)}
      </div>
    `,
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendLeadNotificationEmail({
  lead,
  submittedAt,
}: {
  lead: ServiceRequestFormValues;
  submittedAt: Date;
}) {
  await sendNotificationEmail({
    subject: "New Service Request Received",
    rows: [
      ["Full name", lead.fullName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Property address", lead.address],
      ["Service type", serviceTypeLabel(lead.serviceType)],
      ["Number of dogs", lead.dogs],
      ["Yard size", yardSizeLabel(lead.yardSize)],
      [
        "Loudoun County confirmation",
        lead.loudounCounty ? "Confirmed" : "Not confirmed",
      ],
      ["Access notes", formatOptional(lead.accessNotes)],
      ["Message", formatOptional(lead.message)],
      ["Submitted date", formatSubmittedDate(submittedAt)],
    ],
  });
}

export async function sendContactNotificationEmail({
  message,
  submittedAt,
}: {
  message: ContactFormValues;
  submittedAt: Date;
}) {
  await sendNotificationEmail({
    subject: "New Contact Message Received",
    rows: [
      ["Full name", message.fullName],
      ["Email", message.email],
      ["Phone", formatOptional(message.phone)],
      ["Message", message.message],
      ["Submitted date", formatSubmittedDate(submittedAt)],
    ],
  });
}

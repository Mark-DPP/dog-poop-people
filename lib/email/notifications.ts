import "server-only";

import { Resend } from "resend";

import type {
  ContactFormValues,
  ServiceRequestFormValues,
} from "@/lib/forms";
import type { Lead } from "@/lib/generated/prisma/client";
import {
  leadStatusLabels,
  serviceTypeLabels,
  yardSizeLabels,
} from "@/lib/admin/format";

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

function renderDetailRows(rows: Array<[string, string]>) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px">
      <tbody>
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:0">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dfe8d8;border-radius:14px;overflow:hidden;background:#ffffff">
                    <tr>
                      <td width="210" style="padding:13px 15px;background:#f3f8ef;color:#405244;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;vertical-align:top">${escapeHtml(label)}</td>
                      <td style="padding:13px 15px;color:#12321c;font-size:14px;font-weight:700;line-height:1.55;white-space:pre-wrap;vertical-align:top">${escapeHtml(value)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function getPreviewRows(rows: Array<[string, string]>) {
  return rows.slice(0, 4);
}

function renderNotificationHtml({
  subject,
  rows,
  intro,
  nextStep,
}: {
  subject: string;
  rows: Array<[string, string]>;
  intro: string;
  nextStep: string;
}) {
  const previewRows = getPreviewRows(rows);

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f6f1df;font-family:Arial,Helvetica,sans-serif;color:#12321c">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">
          ${escapeHtml(subject)} from Dog Poop People.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1df;padding:28px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border-collapse:collapse">
                <tr>
                  <td style="border-radius:24px 24px 0 0;background:#0f5a24;padding:28px 30px;color:#ffffff">
                    <div style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#bdf09d">Dog Poop People</div>
                    <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;font-weight:900;color:#ffffff">${escapeHtml(subject)}</h1>
                    <p style="margin:10px 0 0;color:#e8f7df;font-size:15px;line-height:1.6">${escapeHtml(intro)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ffffff;padding:0 30px 30px;border-right:1px solid #e5eddc;border-left:1px solid #e5eddc;border-bottom:1px solid #e5eddc;border-radius:0 0 24px 24px">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:-18px 0 22px;border-collapse:collapse">
                      <tr>
                        <td style="border-radius:18px;background:#65c22e;padding:18px 20px;color:#073516">
                          <div style="font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase">Quick summary</div>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;border-collapse:collapse">
                            ${previewRows
                              .map(
                                ([label, value]) => `
                                  <tr>
                                    <td style="padding:4px 16px 4px 0;font-size:13px;font-weight:900;white-space:nowrap">${escapeHtml(label)}</td>
                                    <td style="padding:4px 0;font-size:13px;font-weight:700">${escapeHtml(value)}</td>
                                  </tr>
                                `,
                              )
                              .join("")}
                          </table>
                        </td>
                      </tr>
                    </table>
                    <h2 style="margin:0 0 14px;font-size:18px;line-height:1.3;color:#0f5a24">Submission details</h2>
                    ${renderDetailRows(rows)}
                    <div style="margin-top:24px;border-radius:18px;background:#fff8e6;padding:18px 20px;color:#405244;font-size:14px;line-height:1.65">
                      <strong style="color:#0f5a24">Next step:</strong> ${escapeHtml(nextStep)}
                    </div>
                    <p style="margin:22px 0 0;color:#6b756d;font-size:12px;line-height:1.6">
                      This notification was sent automatically from dogpooppeople.com.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendNotificationEmail({
  subject,
  rows,
  to,
  intro = "A new website submission is ready for admin review.",
  nextStep = "open the admin dashboard, review this record, and update the status after follow-up.",
}: {
  subject: string;
  rows: Array<[string, string]>;
  to?: string;
  intro?: string;
  nextStep?: string;
}) {
  const { resendApiKey, adminEmail, fromEmail } = getNotificationConfig();
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: to ?? adminEmail,
    subject,
    html: renderNotificationHtml({ subject, rows, intro, nextStep }),
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

export async function sendLeadReceivedCustomerEmail({
  lead,
  submittedAt,
}: {
  lead: ServiceRequestFormValues;
  submittedAt: Date;
}) {
  await sendNotificationEmail({
    to: lead.email,
    subject: "We Received Your Dog Poop People Service Request",
    intro:
      "Thanks for reaching out. We received your service request and will review it soon.",
    nextStep:
      "we will contact you after reviewing your property and service details.",
    rows: [
      ["Full name", lead.fullName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Property address", lead.address],
      ["Service type", serviceTypeLabel(lead.serviceType)],
      ["Number of dogs", lead.dogs],
      ["Yard size", yardSizeLabel(lead.yardSize)],
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

export async function sendContactAutoReplyEmail({
  message,
  submittedAt,
}: {
  message: ContactFormValues;
  submittedAt: Date;
}) {
  await sendNotificationEmail({
    to: message.email,
    subject: "We Received Your Dog Poop People Message",
    intro:
      "Thanks for contacting Dog Poop People. We received your message and will reply as soon as possible.",
    nextStep: "we will review your message and get back to you.",
    rows: [
      ["Full name", message.fullName],
      ["Email", message.email],
      ["Phone", formatOptional(message.phone)],
      ["Message", message.message],
      ["Submitted date", formatSubmittedDate(submittedAt)],
    ],
  });
}

function getCustomerStatusMessage(status: Lead["status"]) {
  const messages = {
    NEW_LEAD: "We received your request and will review it soon.",
    CONTACTED: "We have marked your request as contacted after follow-up.",
    SCHEDULED: "Your service request has been scheduled.",
    COMPLETED: "Your service has been marked completed. Thank you for choosing Dog Poop People.",
    CLOSED: "Your request has been closed.",
    NOT_QUALIFIED:
      "Your request is currently marked not qualified for our service rules.",
  } satisfies Record<Lead["status"], string>;

  return messages[status];
}

export async function sendLeadStatusCustomerEmail({ lead }: { lead: Lead }) {
  await sendNotificationEmail({
    to: lead.email,
    subject: `Dog Poop People Request Update: ${leadStatusLabels[lead.status]}`,
    intro: getCustomerStatusMessage(lead.status),
    nextStep:
      "reply to this email or contact us if you have questions about your service request.",
    rows: [
      ["Name", lead.fullName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Property address", lead.propertyAddress],
      ["Service type", serviceTypeLabels[lead.serviceType]],
      ["Current status", leadStatusLabels[lead.status]],
      ["Number of dogs", String(lead.numberOfDogs)],
      ["Yard size", yardSizeLabels[lead.yardSize]],
      ["Updated date", formatSubmittedDate(lead.updatedAt)],
    ],
  });
}

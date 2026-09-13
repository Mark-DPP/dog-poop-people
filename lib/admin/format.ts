import type {
  ContactMessageStatus,
  LeadStatus,
  ServiceType,
  YardSize,
} from "@/lib/generated/prisma/enums";

export const leadStatusLabels = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CLOSED: "Closed",
  NOT_QUALIFIED: "Not Qualified",
} satisfies Record<LeadStatus, string>;

export const contactMessageStatusLabels = {
  UNREAD: "Unread",
  READ: "Read",
  ARCHIVED: "Archived",
} satisfies Record<ContactMessageStatus, string>;

export const serviceTypeLabels = {
  ONE_TIME: "One-Time Clean",
  WEEKLY: "Weekly Service",
  BI_WEEKLY: "Bi-Weekly Service",
  MONTHLY: "Monthly Service",
} satisfies Record<ServiceType, string>;

export const yardSizeLabels = {
  UNDER_QUARTER: "Under 1/4 acre",
  EXACT_QUARTER: "Exactly 1/4 acre",
  OVER_QUARTER: "Over 1/4 acre",
} satisfies Record<YardSize, string>;

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

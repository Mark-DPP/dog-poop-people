import "server-only";

import { z } from "zod";

export const leadStatusSchema = z.enum([
  "NEW_LEAD",
  "CONTACTED",
  "SCHEDULED",
  "COMPLETED",
  "CLOSED",
  "NOT_QUALIFIED",
]);

export const contactMessageStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "ARCHIVED",
]);

export const serviceTypeSchema = z.enum(["ONE_TIME", "WEEKLY"]);

export const yardSizeSchema = z.enum([
  "UNDER_QUARTER",
  "EXACT_QUARTER",
  "OVER_QUARTER",
]);

export const createLeadSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.email().trim().toLowerCase().max(255),
  phone: z.string().trim().min(1).max(40),
  propertyAddress: z.string().trim().min(1).max(255),
  serviceType: serviceTypeSchema,
  numberOfDogs: z.int().min(1).max(20),
  yardSize: yardSizeSchema,
  isInLoudounCounty: z.boolean(),
  accessNotes: z.string().trim().max(5000).optional(),
  message: z.string().trim().max(5000).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
  adminNotes: z.string().trim().max(5000).optional(),
});

export const createContactMessageSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.email().trim().toLowerCase().max(255),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(5000),
});

export const updateContactMessageStatusSchema = z.object({
  status: contactMessageStatusSchema,
});

export const createAdminActivitySchema = z.object({
  type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type CreateContactMessageInput = z.infer<
  typeof createContactMessageSchema
>;
export type UpdateContactMessageStatusInput = z.infer<
  typeof updateContactMessageStatusSchema
>;
export type CreateAdminActivityInput = z.infer<
  typeof createAdminActivitySchema
>;


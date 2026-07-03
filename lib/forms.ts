import { z } from "zod";

export const serviceRequestSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required.").max(160),
    email: z.email("Enter a valid email address.").trim().toLowerCase().max(255),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(40, "Phone number is too long."),
    address: z.string().trim().min(1, "Property address is required.").max(255),
    serviceType: z.enum(["one-time", "weekly"], {
      error: "Choose a service type.",
    }),
    dogs: z.enum(["1", "2", "3", "4", "5+"], {
      error: "Choose the number of dogs.",
    }),
    yardSize: z.enum(["under-quarter", "exact-quarter", "over-quarter"], {
      error: "Choose a yard size.",
    }),
    loudounCounty: z.boolean().refine((value) => value, {
      message: "Please confirm this property is in Loudoun County, VA.",
    }),
    accessNotes: z.string().optional(),
    message: z.string().optional(),
    website: z.string().max(0).optional(),
    formStartedAt: z.number().optional(),
  })
  .strict()
  .refine((data) => data.yardSize !== "over-quarter", {
    message: "At this time, we only service dog areas up to 1/4 acre.",
    path: ["yardSize"],
  });

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(160),
  email: z.email("Enter a valid email address.").trim().toLowerCase().max(255),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long.")
    .optional(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
  website: z.string().max(0).optional(),
  formStartedAt: z.number().optional(),
}).strict();

export type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;

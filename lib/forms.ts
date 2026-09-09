import { z } from "zod";

export const YARD_SIZE_UNKNOWN = "unknown";

export const propertyAreaValues = [
  "ENTIRE_YARD",
  "FRONT_YARD",
  "BACKYARD",
  "SPECIFIC_AREA",
] as const;

export type PropertyArea = (typeof propertyAreaValues)[number];

export const propertyAreaLabels: Record<PropertyArea, string> = {
  ENTIRE_YARD: "Entire Yard",
  FRONT_YARD: "Front Yard Only",
  BACKYARD: "Backyard Only",
  SPECIFIC_AREA: "Specific Area / Dog Run",
};

export const serviceRequestSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required.").max(160),
    email: z.email("Enter a valid email address.").trim().toLowerCase().max(255),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(40, "Phone number is too long."),
    street: z.string().trim().min(1, "Street address is required.").max(255),
    city: z.string().trim().min(1, "City is required.").max(120),
    state: z.string().trim().min(1, "State is required.").max(80),
    zip: z.string().trim().min(1, "ZIP code is required.").max(20),
    oneTimeClean: z.boolean(),
    serviceType: z.string().trim().max(40),
    dogs: z.enum(["1", "2", "3", "4", "5+"], {
      error: "Choose the number of dogs.",
    }),
    yardSize: z.string().trim().min(1, "Choose a yard size.").max(40),
    propertyArea: z.enum(propertyAreaValues, {
      error: "Choose which parts of the property need cleaning.",
    }),
    propertyAreaDetail: z.string().trim().max(500).optional(),
    addonServiceIds: z.array(z.string().trim().min(1).max(80)).optional(),
    accessNotes: z.string().optional(),
    message: z.string().optional(),
    website: z.string().max(0).optional(),
    formStartedAt: z.number().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.oneTimeClean && !value.serviceType) {
      ctx.addIssue({
        path: ["serviceType"],
        code: "custom",
        message: "Choose a recurring service.",
      });
    }

    if (
      value.propertyArea === "SPECIFIC_AREA" &&
      !value.propertyAreaDetail?.trim()
    ) {
      ctx.addIssue({
        path: ["propertyAreaDetail"],
        code: "custom",
        message: "Describe the specific area or dog run.",
      });
    }
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

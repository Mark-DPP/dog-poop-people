"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

const leadStatusSchema = z.enum([
  "NEW_LEAD",
  "CONTACTED",
  "SCHEDULED",
  "COMPLETED",
  "CLOSED",
  "NOT_QUALIFIED",
]);

const contactMessageStatusSchema = z.enum(["UNREAD", "READ", "ARCHIVED"]);

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

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/reports");

  return {
    ok: true,
    message: "Lead updated successfully.",
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

"use client";

import { useActionState } from "react";

import {
  deleteLeadAction,
  updateContactMessageStatusAction,
  updateLeadAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContactMessageStatus, LeadStatus } from "@/lib/generated/prisma/enums";

const initialState: AdminActionState = {
  ok: false,
  message: "",
};

function Toast({ state }: { state: AdminActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-[90] max-w-sm rounded-2xl px-5 py-4 text-sm font-extrabold shadow-[0_18px_60px_rgba(6,21,11,0.22)] ${
        state.ok ? "bg-[#E8F7DF] text-[#0F5A24]" : "bg-[#FEF3F2] text-[#B42318]"
      }`}
    >
      {state.message}
    </div>
  );
}

export function LeadUpdateForm({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: LeadStatus;
  adminNotes: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateLeadAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Toast state={state} />
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-2">
        <span className="text-sm font-extrabold text-[#12321C]">Current Status</span>
        <Select name="status" defaultValue={status}>
          <option value="NEW_LEAD">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
          <option value="NOT_QUALIFIED">Not Qualified</option>
        </Select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-extrabold text-[#12321C]">Admin Notes</span>
        <Textarea name="adminNotes" defaultValue={adminNotes ?? ""} />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

export function QuickLeadStatusForm({
  id,
  status,
  label,
}: {
  id: string;
  status: LeadStatus;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(updateLeadAction, initialState);

  return (
    <form action={formAction}>
      <Toast state={state} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Updating..." : label}
      </Button>
    </form>
  );
}

export function DeleteLeadForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteLeadAction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this customer permanently? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Toast state={state} />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
}

export function ContactMessageStatusForm({
  id,
  status,
  label,
  confirmMessage,
}: {
  id: string;
  status: ContactMessageStatus;
  label: string;
  confirmMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateContactMessageStatusAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Toast state={state} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Updating..." : label}
      </Button>
    </form>
  );
}

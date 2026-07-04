"use client";

import { DollarSign, MapPin, Ruler } from "lucide-react";
import { useActionState } from "react";

import {
  updateBusinessSettingsAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  type BusinessSettingsValues,
} from "@/lib/settings/pricing";

const initialState: AdminActionState = {
  ok: false,
  message: "",
};

function dollars(cents: number) {
  return (cents / 100).toFixed(Number.isInteger(cents / 100) ? 0 : 2);
}

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

export function SettingsForm({
  settings,
}: {
  settings: BusinessSettingsValues;
}) {
  const [state, formAction, pending] = useActionState(
    updateBusinessSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-6">
      <Toast state={state} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            name: "firstVisit",
            label: "First Visit",
            value: dollars(settings.firstVisitCents),
            hint: "Shown for one-time service on the request form.",
          },
          {
            name: "weeklyService",
            label: "Weekly Service",
            value: dollars(settings.weeklyServiceCents),
            hint: "Shown for weekly service on the request form.",
          },
          {
            name: "extraDog",
            label: "Extra Dog",
            value: dollars(settings.extraDogCents),
            hint: "Shown below the dog count field.",
          },
        ].map((field) => (
          <label key={field.name} className="grid gap-2 rounded-2xl bg-[#F8FAFC] p-5">
            <span className="flex items-center gap-2 text-sm font-extrabold text-[#12321C]">
              <DollarSign className="size-4 text-[#0F5A24]" />
              {field.label}
            </span>
            <Input
              name={field.name}
              type="number"
              min="0"
              max="999"
              step="0.01"
              defaultValue={field.value}
              required
              aria-label={`${field.label} price`}
            />
            <span className="text-xs font-semibold leading-5 text-[#405244]/64">
              {field.hint}
            </span>
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 rounded-2xl bg-[#F8FAFC] p-5">
          <span className="flex items-center gap-2 text-sm font-extrabold text-[#12321C]">
            <MapPin className="size-4 text-[#0F5A24]" />
            Service Area
          </span>
          <Input
            name="serviceArea"
            defaultValue={settings.serviceArea}
            maxLength={120}
            required
          />
        </label>
        <label className="grid gap-2 rounded-2xl bg-[#F8FAFC] p-5">
          <span className="flex items-center gap-2 text-sm font-extrabold text-[#12321C]">
            <Ruler className="size-4 text-[#0F5A24]" />
            Max Yard Size
          </span>
          <Input
            name="maxYardSize"
            defaultValue={settings.maxYardSize}
            maxLength={80}
            required
          />
        </label>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0F5A24]/10 bg-[#E8F7DF]/60 p-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-extrabold text-[#0F5A24]">
            Current customer-facing pricing
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#405244]/72">
            One-time {formatCurrency(settings.firstVisitCents)}, weekly{" "}
            {formatCurrency(settings.weeklyServiceCents)}, extra dog{" "}
            {formatCurrency(settings.extraDogCents)}.
          </p>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

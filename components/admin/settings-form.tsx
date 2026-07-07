"use client";

import { DollarSign, MapPin, Pencil, Plus, Ruler, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  deleteAddonServiceAction,
  saveAddonServiceAction,
  toggleAddonServiceAction,
  updateBusinessSettingsAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  type AddonServiceConfig,
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
    <div className="grid gap-8">
      <Toast state={state} />
      <form action={formAction} className="grid gap-6">
        <div>
        <h3 className="font-heading text-lg font-extrabold text-[#0F5A24]">
          Pricing Configuration
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {settings.serviceFrequencies.map((field) => (
            <label key={field.id} className="grid gap-2 rounded-2xl bg-[#F8FAFC] p-5">
              <span className="flex items-center gap-2 text-sm font-extrabold text-[#12321C]">
                <DollarSign className="size-4 text-[#0F5A24]" />
                {field.name} Base Price
              </span>
              <Input
                name={`serviceFrequency:${field.id}`}
                type="number"
                min="0"
                max="999"
                step="0.01"
                defaultValue={dollars(field.basePriceCents)}
                required
                aria-label={`${field.name} base price`}
              />
              <span className="text-xs font-semibold leading-5 text-[#405244]/64">
                Shown on the request form.
              </span>
            </label>
          ))}
        </div>
        </div>

        <div>
        <h3 className="font-heading text-lg font-extrabold text-[#0F5A24]">
          Yard Size Configuration
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {settings.yardSizeOptions.map((option) => (
            <div key={option.id} className="grid gap-3 rounded-2xl bg-[#F8FAFC] p-5">
              <p className="text-sm font-extrabold text-[#12321C]">
                Slot {option.slot}
              </p>
              <label className="grid gap-2">
                <span className="text-xs font-extrabold uppercase text-[#405244]/54">
                  Yard Size Name
                </span>
                <Input
                  name={`yardSizeName:${option.slot}`}
                  defaultValue={option.name}
                  maxLength={80}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-extrabold uppercase text-[#405244]/54">
                  Extra Fee
                </span>
                <Input
                  name={`yardSizeFee:${option.slot}`}
                  type="number"
                  min="0"
                  max="999"
                  step="0.01"
                  defaultValue={dollars(option.extraFeeCents)}
                  required
                  aria-label={`Slot ${option.slot} extra fee`}
                />
              </label>
            </div>
          ))}
        </div>
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
            {settings.serviceFrequencies
              .map(
                (frequency) =>
                  `${frequency.name} ${formatCurrency(frequency.basePriceCents)}`,
              )
              .join(", ")}
            . Extra dog {formatCurrency(settings.extraDogCents)}.
          </p>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Settings"}
        </Button>
        </div>
      </form>

      <AddonServicesManager addonServices={settings.addonServices} />
    </div>
  );
}

function AddonDialog({
  addon,
  open,
  onClose,
}: {
  addon?: AddonServiceConfig;
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveAddonServiceAction,
    initialState,
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#12321C]/50 p-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-[0_30px_100px_rgba(6,21,11,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl font-extrabold text-[#0F5A24]">
              {addon ? "Edit Add-on Service" : "Add New Service"}
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#405244]/64">
              Add-ons appear as optional checkboxes on the request form.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-extrabold text-[#405244] hover:bg-[#F8FAFC]"
          >
            Close
          </button>
        </div>

        <form action={formAction} className="mt-6 grid gap-4">
          <Toast state={state} />
          {addon ? <input type="hidden" name="id" value={addon.id} /> : null}
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-[#12321C]">
              Service Name
            </span>
            <Input name="name" defaultValue={addon?.name ?? ""} required maxLength={120} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-[#12321C]">Price</span>
            <Input
              name="price"
              type="number"
              min="0"
              max="999"
              step="0.01"
              defaultValue={addon ? dollars(addon.price) : ""}
              required
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddonToggleForm({ addon }: { addon: AddonServiceConfig }) {
  const [state, formAction] = useActionState(toggleAddonServiceAction, initialState);

  return (
    <form action={formAction}>
      <Toast state={state} />
      <input type="hidden" name="id" value={addon.id} />
      <label className="inline-flex items-center gap-2 text-sm font-extrabold text-[#12321C]">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={addon.isActive}
          className="size-5 rounded border-[#0F5A24]/24 accent-[#65C22E]"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        Enabled
      </label>
    </form>
  );
}

function AddonDeleteForm({ addon }: { addon: AddonServiceConfig }) {
  const [state, formAction, pending] = useActionState(
    deleteAddonServiceAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete ${addon.name}? Old leads will keep their submitted snapshot.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Toast state={state} />
      <input type="hidden" name="id" value={addon.id} />
      <Button type="submit" variant="outline" disabled={pending}>
        <Trash2 className="size-4" />
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
}

function AddonServicesManager({
  addonServices,
}: {
  addonServices: AddonServiceConfig[];
}) {
  const [dialogAddon, setDialogAddon] = useState<AddonServiceConfig | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="grid gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-heading text-lg font-extrabold text-[#0F5A24]">
            Optional Add-on Services
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#405244]/64">
            Active add-ons appear on the customer qualification form.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setDialogAddon(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add New Service
        </Button>
      </div>

      <div className="grid gap-3">
        {addonServices.length > 0 ? (
          addonServices.map((addon) => (
            <div
              key={addon.id}
              className="grid gap-4 rounded-2xl bg-[#F8FAFC] p-5 md:grid-cols-[1fr_130px_130px_auto] md:items-center"
            >
              <div>
                <p className="text-sm font-extrabold text-[#12321C]">{addon.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#405244]/60">
                  Service Name
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#12321C]">
                  {formatCurrency(addon.price)}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#405244]/60">
                  Price
                </p>
              </div>
              <AddonToggleForm addon={addon} />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogAddon(addon);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <AddonDeleteForm addon={addon} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#0F5A24]/20 bg-[#F8FAFC] p-6 text-sm font-semibold text-[#405244]/70">
            No add-on services yet.
          </div>
        )}
      </div>

      <AddonDialog
        key={dialogAddon?.id ?? "new"}
        addon={dialogAddon}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </section>
  );
}

import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import {
  DeleteLeadForm,
  LeadUpdateForm,
  QuickLeadStatusForm,
} from "@/components/admin/admin-action-forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminLink, StatusBadge } from "@/components/admin/admin-primitives";
import { getLeadById } from "@/lib/admin/data";
import {
  formatDateTime,
  leadStatusLabels,
  serviceTypeLabels,
  yardSizeLabels,
} from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";
import { formatCurrency } from "@/lib/settings/pricing";

export const metadata: Metadata = {
  title: "Lead Details | Dog Poop People Admin",
};

type Params = Promise<{ id: string }>;

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] p-4">
      <p className="text-xs font-extrabold uppercase text-[#405244]/48">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-extrabold text-[#12321C]">
        {value}
      </p>
    </div>
  );
}

type AddonSnapshot = {
  id: string;
  name: string;
  price: number;
};

function getAddonSnapshot(value: unknown): AddonSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is AddonSnapshot => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const addon = item as Record<string, unknown>;

    return (
      typeof addon.id === "string" &&
      typeof addon.name === "string" &&
      typeof addon.price === "number"
    );
  });
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminUser(`/admin/leads/${id}`);
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const digits = lead.phone.replace(/\D/g, "");
  const whatsappNumber = digits.length === 10 ? `1${digits}` : digits;
  const selectedAddons = getAddonSnapshot(lead.selectedAddons);

  return (
    <AdminShell
      title={lead.fullName}
      subtitle="Review the full lead submission and update admin follow-up status."
    >
      <div className="flex">
        <AdminLink href="/admin/leads">Back to Leads</AdminLink>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
                Lead Details
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#405244]/64">
                Submitted {formatDateTime(lead.createdAt)}
              </p>
            </div>
            <StatusBadge label={leadStatusLabels[lead.status]} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailItem label="Full name" value={lead.fullName} />
            <DetailItem label="Email" value={lead.email} />
            <DetailItem label="Phone" value={lead.phone} />
            <DetailItem label="Property address" value={lead.propertyAddress} />
            <DetailItem
              label="Service type"
              value={lead.serviceFrequency?.name ?? serviceTypeLabels[lead.serviceType]}
            />
            <DetailItem label="Number of dogs" value={String(lead.numberOfDogs)} />
            <DetailItem
              label="Yard size"
              value={lead.yardSizeOption?.name ?? yardSizeLabels[lead.yardSize]}
            />
            <DetailItem
              label="Final total"
              value={
                typeof lead.calculatedTotalCents === "number"
                  ? formatCurrency(lead.calculatedTotalCents)
                  : "Not recorded"
              }
            />
            <DetailItem
              label="Loudoun County"
              value={lead.isInLoudounCounty ? "Confirmed" : "Not confirmed"}
            />
            <DetailItem label="Access notes" value={lead.accessNotes || "Not provided"} />
            <DetailItem label="Message" value={lead.message || "Not provided"} />
            <DetailItem label="Current status" value={leadStatusLabels[lead.status]} />
            <DetailItem label="Admin notes" value={lead.adminNotes || "No notes yet"} />
          </div>

          <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase text-[#405244]/48">
                  Selected Add-ons
                </p>
                <p className="mt-1 text-sm font-semibold text-[#405244]/64">
                  Submitted add-on snapshot.
                </p>
              </div>
              <p className="font-heading text-2xl font-extrabold text-[#0F5A24]">
                {typeof lead.calculatedTotalCents === "number"
                  ? formatCurrency(lead.calculatedTotalCents)
                  : "Not recorded"}
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {selectedAddons.length > 0 ? (
                selectedAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3"
                  >
                    <span className="text-sm font-extrabold text-[#12321C]">
                      {addon.name}
                    </span>
                    <span className="text-sm font-extrabold text-[#0F5A24]">
                      {formatCurrency(addon.price)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#405244]/64">
                  No add-ons selected.
                </p>
              )}
            </div>
          </div>
        </AdminCard>

        <div className="grid gap-6">
          <AdminCard>
            <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
              Contact Customer
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${lead.email}?subject=Dog Poop People Service Request`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0F5A24]/15 bg-white px-5 text-sm font-extrabold text-[#0F5A24] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF8E6]"
              >
                <Mail className="size-4" />
                Email
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0F5A24]/15 bg-white px-5 text-sm font-extrabold text-[#0F5A24] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF8E6]"
              >
                <Phone className="size-4" />
                Call
              </a>
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0F5A24]/15 bg-white px-5 text-sm font-extrabold text-[#0F5A24] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF8E6]"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
              Update Lead
            </h2>
            <div className="mt-5">
              <LeadUpdateForm
                id={lead.id}
                status={lead.status}
                adminNotes={lead.adminNotes}
              />
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
              Quick Actions
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <QuickLeadStatusForm id={lead.id} status="CONTACTED" label="Mark Contacted" />
              <QuickLeadStatusForm id={lead.id} status="SCHEDULED" label="Mark Scheduled" />
              <QuickLeadStatusForm id={lead.id} status="COMPLETED" label="Mark Completed" />
              <QuickLeadStatusForm
                id={lead.id}
                status="NOT_QUALIFIED"
                label="Mark Not Qualified"
              />
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
              Delete Customer
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#405244]/64">
              Permanently remove this customer record from the database.
            </p>
            <div className="mt-5">
              <DeleteLeadForm id={lead.id} />
            </div>
          </AdminCard>
        </div>
      </section>
    </AdminShell>
  );
}

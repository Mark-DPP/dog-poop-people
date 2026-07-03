import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminCard,
  AdminLink,
  EmptyState,
  Pagination,
  StatusBadge,
} from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getLeads } from "@/lib/admin/data";
import {
  formatDateTime,
  leadStatusLabels,
  serviceTypeLabels,
} from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";
import type { LeadStatus, ServiceType } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Leads | Dog Poop People Admin",
};

type SearchParams = Promise<{
  q?: string;
  status?: string;
  serviceType?: string;
  page?: string;
}>;

function parseLeadStatus(value?: string): LeadStatus | "ALL" {
  const statuses = [
    "NEW_LEAD",
    "CONTACTED",
    "SCHEDULED",
    "COMPLETED",
    "CLOSED",
    "NOT_QUALIFIED",
  ];
  return statuses.includes(value ?? "") ? (value as LeadStatus) : "ALL";
}

function parseServiceType(value?: string): ServiceType | "ALL" {
  return value === "ONE_TIME" || value === "WEEKLY" ? value : "ALL";
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminUser("/admin/leads");
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const status = parseLeadStatus(params.status);
  const serviceType = parseServiceType(params.serviceType);
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const leads = await getLeads({ search, status, serviceType, page });
  const paginationParams = new URLSearchParams();

  if (search) paginationParams.set("q", search);
  if (status !== "ALL") paginationParams.set("status", status);
  if (serviceType !== "ALL") paginationParams.set("serviceType", serviceType);

  return (
    <AdminShell
      title="Leads"
      subtitle="Search, filter, and review real customer qualification submissions."
    >
      <AdminCard>
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">
              Search
            </span>
            <Input
              name="q"
              defaultValue={search}
              placeholder="Name, email, phone, address"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">
              Status
            </span>
            <Select name="status" defaultValue={status}>
              <option value="ALL">All Statuses</option>
              {Object.entries(leadStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">
              Service
            </span>
            <Select name="serviceType" defaultValue={serviceType}>
              <option value="ALL">All Services</option>
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit">Apply Filters</Button>
        </form>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
              Lead Results
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#405244]/64">
              {leads.total} matching leads, sorted newest first.
            </p>
          </div>
        </div>

        <div className="no-scrollbar mt-5 overflow-x-auto">
          {leads.items.length > 0 ? (
            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs font-extrabold uppercase text-[#405244]/48">
                <tr>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Service</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Submitted</th>
                  <th className="px-4 py-2">Open</th>
                </tr>
              </thead>
              <tbody>
                {leads.items.map((lead) => (
                  <tr key={lead.id} className="bg-[#F8FAFC]">
                    <td className="rounded-l-2xl px-4 py-4">
                      <p className="text-sm font-extrabold">{lead.fullName}</p>
                      <p className="mt-1 text-xs font-semibold text-[#405244]/56">
                        {lead.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                      {lead.propertyAddress}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                      {serviceTypeLabels[lead.serviceType]}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge label={leadStatusLabels[lead.status]} />
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#405244]/70">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <AdminLink href={`/admin/leads/${lead.id}`}>View</AdminLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No leads found"
              copy="Try clearing filters or wait for new service requests."
            />
          )}
        </div>
      </AdminCard>

      <Pagination
        page={page}
        pageCount={leads.pageCount}
        basePath="/admin/leads"
        params={paginationParams}
      />
    </AdminShell>
  );
}


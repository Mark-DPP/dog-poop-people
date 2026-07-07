import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminLink, EmptyState, StatusBadge } from "@/components/admin/admin-primitives";
import { getCustomers } from "@/lib/admin/data";
import { formatDateTime, leadStatusLabels, serviceTypeLabels } from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Customers | Dog Poop People Admin",
};

export default async function Page() {
  await requireAdminUser("/admin/customers");
  const customers = await getCustomers();

  return (
    <AdminShell
      title="Customers"
      subtitle="Leads that became customers by being scheduled or completed."
    >
      <AdminCard>
        <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
          Customers
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#405244]/64">
          {customers.length} scheduled or completed customers.
        </p>

        <div className="no-scrollbar mt-5 overflow-x-auto">
          {customers.length > 0 ? (
            <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs font-extrabold uppercase text-[#405244]/48">
                <tr>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Service</th>
                  <th className="px-4 py-2">Dogs</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Last Updated</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Open</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const digits = customer.phone.replace(/\D/g, "");
                  const whatsappNumber =
                    digits.length === 10 ? `1${digits}` : digits;

                  return (
                    <tr key={customer.id} className="bg-[#F8FAFC]">
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="text-sm font-extrabold">{customer.fullName}</p>
                        <p className="mt-1 text-xs font-semibold text-[#405244]/56">
                          {customer.email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                        {customer.propertyAddress}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                        {customer.serviceFrequency?.name ??
                          serviceTypeLabels[customer.serviceType]}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                        {customer.numberOfDogs}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#405244]">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge label={leadStatusLabels[customer.status]} />
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#405244]/70">
                        {formatDateTime(customer.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <a
                            href={`mailto:${customer.email}?subject=Dog Poop People Service Update`}
                            className="flex size-10 items-center justify-center rounded-full bg-white text-[#0F5A24] shadow-sm transition hover:bg-[#E8F7DF]"
                            aria-label={`Email ${customer.fullName}`}
                          >
                            <Mail className="size-4" />
                          </a>
                          <a
                            href={`tel:${customer.phone}`}
                            className="flex size-10 items-center justify-center rounded-full bg-white text-[#0F5A24] shadow-sm transition hover:bg-[#E8F7DF]"
                            aria-label={`Call ${customer.fullName}`}
                          >
                            <Phone className="size-4" />
                          </a>
                          {whatsappNumber ? (
                            <a
                              href={`https://wa.me/${whatsappNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex size-10 items-center justify-center rounded-full bg-white text-[#0F5A24] shadow-sm transition hover:bg-[#E8F7DF]"
                              aria-label={`WhatsApp ${customer.fullName}`}
                            >
                              <MessageCircle className="size-4" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <AdminLink href={`/admin/leads/${customer.id}`}>View</AdminLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No customers yet"
              copy="Scheduled or completed leads will appear here."
            />
          )}
        </div>
      </AdminCard>
    </AdminShell>
  );
}

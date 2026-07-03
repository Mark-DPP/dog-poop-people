import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminLink, EmptyState, StatusBadge } from "@/components/admin/admin-primitives";
import { getWeeklyCustomers } from "@/lib/admin/data";
import { formatDateTime, leadStatusLabels } from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Customers | Dog Poop People Admin",
};

export default async function Page() {
  await requireAdminUser("/admin/customers");
  const customers = await getWeeklyCustomers();

  return (
    <AdminShell
      title="Customers"
      subtitle="Weekly service leads that are scheduled or completed."
    >
      <AdminCard>
        <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
          Weekly Customers
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#405244]/64">
          {customers.length} active or completed weekly customers.
        </p>

        <div className="no-scrollbar mt-5 overflow-x-auto">
          {customers.length > 0 ? (
            <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs font-extrabold uppercase text-[#405244]/48">
                <tr>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Dogs</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Last Updated</th>
                  <th className="px-4 py-2">Open</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
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
                    <td className="rounded-r-2xl px-4 py-4">
                      <AdminLink href={`/admin/leads/${customer.id}`}>View</AdminLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No weekly customers yet"
              copy="Completed or scheduled weekly leads will appear here."
            />
          )}
        </div>
      </AdminCard>
    </AdminShell>
  );
}


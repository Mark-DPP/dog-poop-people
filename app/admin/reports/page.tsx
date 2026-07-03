import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";
import { getReportsData } from "@/lib/admin/data";
import { leadStatusLabels, serviceTypeLabels } from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Reports | Dog Poop People Admin",
};

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between gap-4 text-sm font-extrabold text-[#405244]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#EEF4EF]">
        <div
          className="h-full rounded-full bg-[#65C22E]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default async function Page() {
  await requireAdminUser("/admin/reports");
  const reports = await getReportsData();

  return (
    <AdminShell
      title="Reports"
      subtitle="Simple live counts from leads, services, jobs, and messages."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Leads", reports.totalLeads],
          ["Completed Jobs", reports.completedJobs],
          ["Not Qualified", reports.notQualifiedLeads],
          ["Contact Messages", reports.contactMessages],
        ].map(([label, value]) => (
          <AdminCard key={label}>
            <p className="text-sm font-extrabold text-[#405244]/62">{label}</p>
            <p className="mt-2 font-heading text-3xl font-extrabold text-[#0F5A24]">
              {value}
            </p>
          </AdminCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
            Leads by Status
          </h2>
          <div className="mt-6 grid gap-5">
            {Object.entries(leadStatusLabels).map(([status, label]) => {
              const item = reports.leadsByStatus.find((row) => row.status === status);
              return (
                <ProgressRow
                  key={status}
                  label={label}
                  value={item?._count.status ?? 0}
                  total={reports.totalLeads}
                />
              );
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
            Leads by Service Type
          </h2>
          <div className="mt-6 grid gap-5">
            {Object.entries(serviceTypeLabels).map(([serviceType, label]) => {
              const item = reports.leadsByServiceType.find(
                (row) => row.serviceType === serviceType,
              );
              return (
                <ProgressRow
                  key={serviceType}
                  label={label}
                  value={item?._count.serviceType ?? 0}
                  total={reports.totalLeads}
                />
              );
            })}
          </div>
        </AdminCard>
      </section>
    </AdminShell>
  );
}


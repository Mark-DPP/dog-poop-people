import type { Metadata } from "next";
import {
  CalendarCheck,
  CheckCircle2,
  Mail,
  Repeat2,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminLink, EmptyState, StatusBadge } from "@/components/admin/admin-primitives";
import { getDashboardData } from "@/lib/admin/data";
import {
  formatDateTime,
  formatPercent,
  leadStatusLabels,
  serviceTypeLabels,
} from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard | Dog Poop People",
  description: "Dog Poop People live admin dashboard.",
};

const statIcons = {
  totalLeads: UsersRound,
  newLeads: Sparkles,
  contactedLeads: UsersRound,
  scheduledJobs: CalendarCheck,
  completedJobs: CheckCircle2,
  weeklyCustomers: Repeat2,
  contactMessages: Mail,
  conversionRate: TrendingUp,
};

function statCards(stats: Awaited<ReturnType<typeof getDashboardData>>["stats"]) {
  return [
    { label: "Total Leads", value: stats.totalLeads, icon: statIcons.totalLeads },
    { label: "New Leads", value: stats.newLeads, icon: statIcons.newLeads },
    { label: "Contacted Leads", value: stats.contactedLeads, icon: statIcons.contactedLeads },
    { label: "Scheduled Jobs", value: stats.scheduledJobs, icon: statIcons.scheduledJobs },
    { label: "Completed Jobs", value: stats.completedJobs, icon: statIcons.completedJobs },
    { label: "Weekly Customers", value: stats.weeklyCustomers, icon: statIcons.weeklyCustomers },
    { label: "Contact Messages", value: stats.contactMessages, icon: statIcons.contactMessages },
    {
      label: "Conversion Rate",
      value: formatPercent(stats.conversionRate),
      icon: statIcons.conversionRate,
    },
  ];
}

export default async function Page() {
  await requireAdminUser("/admin/dashboard");
  const { stats, recentLeads, recentActivity } = await getDashboardData();

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Live lead, message, and activity data from the database."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards(stats).map((stat) => {
          const Icon = stat.icon;
          return (
            <AdminCard key={stat.label}>
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#0F5A24] text-[#65C22E]">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-5 text-sm font-extrabold text-[#405244]/62">{stat.label}</p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-[#0F5A24]">
                {stat.value}
              </p>
            </AdminCard>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
                Recent Leads
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#405244]/64">
                Newest service requests.
              </p>
            </div>
            <AdminLink href="/admin/leads">View all</AdminLink>
          </div>
          <div className="no-scrollbar mt-5 overflow-x-auto">
            {recentLeads.length > 0 ? (
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
                <thead className="text-xs font-extrabold uppercase text-[#405244]/48">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Service</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Submitted</th>
                    <th className="px-4 py-2">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="bg-[#F8FAFC]">
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="text-sm font-extrabold">{lead.fullName}</p>
                        <p className="mt-1 text-xs font-semibold text-[#405244]/56">{lead.email}</p>
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
              <EmptyState title="No leads yet" copy="Service requests will appear here." />
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
            Recent Activity
          </h2>
          <div className="mt-5 grid gap-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl bg-[#F8FAFC] p-4">
                  <p className="text-sm font-extrabold text-[#12321C]">{activity.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#405244]/64">
                    {activity.description || activity.type}
                  </p>
                  <p className="mt-2 text-xs font-bold text-[#65C22E]">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No activity yet" copy="Admin actions and submissions will appear here." />
            )}
          </div>
        </AdminCard>
      </section>
    </AdminShell>
  );
}


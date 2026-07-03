"use client";

import { useClerk } from "@clerk/nextjs";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  Eye,
  FileDown,
  Filter,
  Save,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  activity,
  leads,
  quickActions,
  sidebarItems,
  stats,
  tasks,
  type LeadStatus,
  type Lead,
  type StatCard,
} from "@/components/admin/admin-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  "New Lead": "bg-blue-50 text-blue-700 ring-blue-100",
  Contacted: "bg-orange-50 text-orange-700 ring-orange-100",
  Scheduled: "bg-purple-50 text-purple-700 ring-purple-100",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
  "Not Qualified": "bg-red-50 text-red-700 ring-red-100",
};

type AdminSection = "Dashboard" | "Leads" | "Customers" | "Reports" | "Settings";
type LeadModalMode = "view" | "edit";
type LeadModalState = {
  lead: Lead;
  mode: LeadModalMode;
} | null;

const sectionSubtitles: Record<AdminSection, string> = {
  Dashboard: "Here's what's happening with your business today.",
  Leads: "Review requests, track status, and prepare follow-ups.",
  Customers: "Manage recurring customers and weekly service routes.",
  Reports: "Monitor service mix, lead activity, and business performance.",
  Settings: "Adjust administrator preferences and portal defaults.",
};

const allStatusOptions: Array<LeadStatus | "All"> = [
  "All",
  "New Lead",
  "Contacted",
  "Scheduled",
  "Completed",
  "Closed",
  "Not Qualified",
];

const notificationItems = [
  {
    title: "New service request",
    detail: "Amanda Lewis requested weekly cleanup.",
    time: "12m ago",
  },
  {
    title: "Lead needs follow-up",
    detail: "Brian Carter has been contacted once.",
    time: "1h ago",
  },
  {
    title: "Route reminder",
    detail: "Thursday weekly customers are ready for review.",
    time: "3h ago",
  },
];

const cardMotion = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
} as const;

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 26, stiffness: 90 });
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function Sidebar({
  activeSection,
  onSelect,
  onLogout,
}: {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#0F5A24]/8 bg-white/95 px-5 py-6 shadow-[18px_0_60px_rgba(15,90,36,0.07)] backdrop-blur-2xl lg:block">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Dog Poop People"
          width={58}
          height={54}
          className="h-12 w-auto object-contain"
        />
        <div>
          <p className="font-heading text-lg font-extrabold tracking-normal text-[#0F5A24]">
            Dog Poop People
          </p>
          <p className="text-xs font-bold uppercase text-[#405244]/48">Admin CRM</p>
        </div>
      </div>

      <nav className="mt-10 grid gap-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === "Logout") {
                  onLogout();
                  return;
                }

                onSelect(item.label as AdminSection);
              }}
              className={cn(
                "group flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70",
                item.label === activeSection
                  ? "bg-[#0F5A24] text-white shadow-[0_18px_45px_rgba(15,90,36,0.22)]"
                  : "text-[#405244]/78 hover:-translate-y-0.5 hover:bg-[#F3F8F1] hover:text-[#0F5A24]",
              )}
            >
              <Icon className={cn("size-5", item.label === activeSection ? "text-[#65C22E]" : "text-[#0F5A24]/52 group-hover:text-[#65C22E]")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="absolute inset-x-5 bottom-6 rounded-2xl border border-[#0F5A24]/8 bg-[#FFF8E6] p-4">
        <p className="text-sm font-extrabold text-[#0F5A24]">Route snapshot</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#405244]/68">
          8 jobs scheduled across Ashburn, Leesburg, and Sterling today.
        </p>
      </div>
    </aside>
  );
}

function MobileNav({
  activeSection,
  onSelect,
  onLogout,
}: {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
  onLogout: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-[#0F5A24]/8 bg-white/94 px-4 py-3 shadow-[0_10px_34px_rgba(15,90,36,0.06)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Dog Poop People" width={44} height={42} className="h-10 w-auto" />
          <span className="font-heading text-base font-extrabold text-[#0F5A24]">Admin Portal</span>
        </div>
        <span className="rounded-full bg-[#E8F7DF] px-3 py-1.5 text-xs font-extrabold text-[#0F5A24] ring-1 ring-[#0F5A24]/8">
          Mock CRM
        </span>
      </div>
      <div className="relative -mx-1 mt-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 pb-1">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.label === "Logout") {
                onLogout();
                return;
              }

              onSelect(item.label as AdminSection);
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70",
              item.label === activeSection ? "bg-[#0F5A24] text-white shadow-[0_10px_28px_rgba(15,90,36,0.2)]" : "bg-[#F1F5F9] text-[#405244]",
            )}
          >
            {item.label}
          </button>
        ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/95 to-transparent" />
      </div>
    </div>
  );
}

function DashboardHeader({
  activeSection,
  notificationOpen,
  onToggleNotifications,
}: {
  activeSection: AdminSection;
  notificationOpen: boolean;
  onToggleNotifications: () => void;
}) {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <motion.header
      className="grid gap-6 xl:grid-cols-[1fr_auto]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-sm font-extrabold uppercase text-[#65C22E]">Good Morning, Mark 👋</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-normal text-[#0F5A24] sm:text-4xl">
          {activeSection}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#405244]/70">
          {sectionSubtitles[activeSection]}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
        <label className="relative min-w-0 sm:w-[320px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/46" />
          <input
            type="search"
            placeholder="Search leads, customers, jobs"
            className="h-12 w-full rounded-2xl border border-[#0F5A24]/10 bg-white px-11 text-sm font-bold text-[#12321C] shadow-[0_12px_35px_rgba(15,90,36,0.06)] outline-none transition placeholder:text-[#405244]/42 focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
          />
        </label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={onToggleNotifications}
              className="relative flex size-12 items-center justify-center rounded-2xl border border-[#0F5A24]/10 bg-white text-[#0F5A24] shadow-[0_12px_35px_rgba(15,90,36,0.06)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
            >
              <Bell className="size-5" />
              <span className="absolute right-3 top-3 size-2 rounded-full bg-[#65C22E]" />
            </button>
            {notificationOpen ? (
              <motion.div
                className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[#0F5A24]/10 bg-white p-3 shadow-[0_24px_80px_rgba(15,90,36,0.18)]"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="font-heading text-base font-extrabold text-[#0F5A24]">Notifications</p>
                  <span className="rounded-full bg-[#E8F7DF] px-2.5 py-1 text-xs font-extrabold text-[#0F5A24]">
                    {notificationItems.length} new
                  </span>
                </div>
                <div className="mt-1 grid gap-2">
                  {notificationItems.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className="rounded-2xl bg-[#F8FAFC] p-3 text-left transition hover:bg-[#F3F8F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
                    >
                      <p className="text-sm font-extrabold text-[#12321C]">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#405244]/64">{item.detail}</p>
                      <p className="mt-2 text-xs font-bold text-[#65C22E]">{item.time}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </div>
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#0F5A24]/10 bg-white px-3 shadow-[0_12px_35px_rgba(15,90,36,0.06)]">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#0F5A24] font-heading text-xs font-extrabold text-white">
              MK
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-extrabold text-[#12321C]">Mark</p>
              <p className="text-[11px] font-bold text-[#405244]/52">{currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function StatCardView({ stat, index }: { stat: StatCard; index: number }) {
  const Icon = stat.icon;

  return (
    <motion.article
      {...cardMotion}
      transition={{ ...cardMotion.transition, delay: index * 0.04 }}
      className={cn(
        "group rounded-2xl border border-[#0F5A24]/8 bg-gradient-to-br p-5 shadow-[0_18px_55px_rgba(15,90,36,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#65C22E]/25 hover:shadow-[0_24px_70px_rgba(15,90,36,0.14)]",
        stat.gradient,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-13 items-center justify-center rounded-2xl bg-[#0F5A24] text-[#65C22E] shadow-[0_16px_38px_rgba(15,90,36,0.2)]">
          <Icon className="size-6" />
        </div>
        <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-extrabold text-[#0F5A24] ring-1 ring-[#0F5A24]/8">
          {stat.trend}
        </span>
      </div>
      <p className="mt-6 text-sm font-extrabold text-[#405244]/62">{stat.label}</p>
      <p className="mt-2 font-heading text-4xl font-extrabold tracking-normal text-[#0F5A24]">
        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
      </p>
    </motion.article>
  );
}

function RecentLeads({
  items = leads,
  showViewAll = true,
  onViewAll,
  onViewLead,
  onEditLead,
}: {
  items?: Lead[];
  showViewAll?: boolean;
  onViewAll?: () => void;
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}) {
  return (
    <motion.section
      {...cardMotion}
      className="min-w-0 rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_20px_70px_rgba(15,90,36,0.08)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Recent Leads</h2>
          <p className="mt-1 text-sm font-semibold text-[#405244]/64">Newest service requests and current status.</p>
        </div>
        {showViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3F8F1] px-4 py-2 text-sm font-extrabold text-[#0F5A24] transition hover:-translate-y-0.5 hover:bg-[#E8F7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            View all
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
        <span className="rounded-full bg-[#F3F8F1] px-3 py-1 text-xs font-extrabold text-[#0F5A24]">
          Swipe table
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-[#0F5A24]/10 to-transparent" />
      </div>

      <div className="no-scrollbar mt-5 w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-xs font-extrabold uppercase text-[#405244]/48">
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Dogs</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((lead) => (
              <tr key={lead.email} className="group rounded-2xl bg-[#F8FAFC] transition hover:bg-[#F3F8F1]">
                <td className="rounded-l-2xl px-4 py-4">
                  <p className="text-sm font-extrabold text-[#12321C]">{lead.customer}</p>
                  <p className="mt-1 text-xs font-semibold text-[#405244]/54">{lead.email}</p>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-[#405244]">{lead.service}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#405244]">{lead.dogs}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#405244]">{lead.address}</td>
                <td className="px-4 py-4">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1", statusStyles[lead.status])}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-[#405244]/70">{lead.submitted}</td>
                <td className="rounded-r-2xl px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onViewLead(lead)}
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-[#0F5A24] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E8F7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
                      aria-label={`View ${lead.customer}`}
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditLead(lead)}
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-[#0F5A24] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E8F7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
                      aria-label={`Edit ${lead.customer}`}
                    >
                      <Edit3 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <div className="rounded-2xl bg-[#F8FAFC] px-4 py-10 text-center text-sm font-bold text-[#405244]/64">
            No leads match the selected filters.
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

function QuickActions({
  onAddLead,
  onReviewRequests,
  onViewCustomers,
  onExportLeads,
}: {
  onAddLead: () => void;
  onReviewRequests: () => void;
  onViewCustomers: () => void;
  onExportLeads: () => void;
}) {
  const actionHandlers: Record<string, () => void> = {
    "Add Lead": onAddLead,
    "Review New Requests": onReviewRequests,
    "View Weekly Customers": onViewCustomers,
    "Export Leads": onExportLeads,
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.title}
            type="button"
            onClick={actionHandlers[action.title]}
            {...cardMotion}
            transition={{ ...cardMotion.transition, delay: index * 0.04 }}
            className="group rounded-2xl border border-[#0F5A24]/8 bg-white p-5 text-left shadow-[0_18px_55px_rgba(15,90,36,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#65C22E]/25 hover:shadow-[0_24px_70px_rgba(15,90,36,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24] transition group-hover:bg-[#0F5A24] group-hover:text-[#65C22E]">
              <Icon className="size-5" />
            </span>
            <span className="mt-5 block font-heading text-lg font-extrabold tracking-normal text-[#0F5A24]">{action.title}</span>
            <span className="mt-1 block text-sm font-semibold text-[#405244]/62">{action.detail}</span>
          </motion.button>
        );
      })}
    </section>
  );
}

function BusinessOverview() {
  const points = [18, 34, 26, 48, 41, 58, 52, 70, 64, 82];

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <motion.article {...cardMotion} className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_20px_70px_rgba(15,90,36,0.08)]">
        <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Service Distribution</h2>
        <div className="mt-7 grid gap-6">
          {[
            { label: "Weekly Service", value: 72, color: "bg-[#65C22E]" },
            { label: "One Time Service", value: 28, color: "bg-[#F5B84B]" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between text-sm font-extrabold text-[#405244]">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#EEF4EF]">
                <motion.div
                  className={cn("h-full rounded-full", item.color)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.article>

      <motion.article {...cardMotion} className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_20px_70px_rgba(15,90,36,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Lead Activity</h2>
          <span className="rounded-full bg-[#F3F8F1] px-3 py-1 text-xs font-extrabold text-[#0F5A24]">Last 10 days</span>
        </div>
        <div className="mt-7 h-48 rounded-2xl bg-[#F8FAFC] p-5">
          <div className="flex h-full items-end gap-2">
            {points.map((point, index) => (
              <motion.div
                key={`${point}-${index}`}
                className="flex-1 rounded-t-xl bg-gradient-to-t from-[#0F5A24] to-[#65C22E]"
                initial={{ height: 0 }}
                whileInView={{ height: `${point}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        </div>
      </motion.article>
    </section>
  );
}

function SectionSummary({
  title,
  copy,
  stats: summaryStats,
}: {
  title: string;
  copy: string;
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <motion.section
      {...cardMotion}
      className="rounded-2xl border border-white/20 bg-gradient-to-br from-[#0F5A24] via-[#16692D] to-[#65C22E] p-6 text-white shadow-[0_24px_80px_rgba(15,90,36,0.18)]"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase text-[#BDF09D]">Mock workspace</p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-normal">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72">{copy}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {summaryStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur-md">
              <p className="font-heading text-2xl font-extrabold tracking-normal">{item.value}</p>
              <p className="mt-1 text-xs font-bold text-white/66">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function LeadFilters({
  searchTerm,
  statusFilter,
  serviceFilter,
  onSearchChange,
  onStatusChange,
  onServiceChange,
  resultCount,
}: {
  searchTerm: string;
  statusFilter: LeadStatus | "All";
  serviceFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "All") => void;
  onServiceChange: (value: string) => void;
  resultCount: number;
}) {
  return (
    <motion.section
      {...cardMotion}
      className="rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,90,36,0.07)]"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
              <Filter className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Lead Filters</h2>
              <p className="mt-1 text-sm font-semibold text-[#405244]/62">{resultCount} matching leads</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[760px]">
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">Search</span>
            <span className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/42" />
              <input
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Name, email, address"
                className="h-12 w-full rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-11 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
              />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value as LeadStatus | "All")}
              className="h-12 rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-4 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
            >
              {allStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase text-[#405244]/54">Service</span>
            <select
              value={serviceFilter}
              onChange={(event) => onServiceChange(event.target.value)}
              className="h-12 rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-4 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
            >
              <option value="All">All Services</option>
              <option value="Weekly Service">Weekly Service</option>
              <option value="One Time Service">One Time Service</option>
            </select>
          </label>
        </div>
      </div>
    </motion.section>
  );
}

function LeadModal({
  state,
  onClose,
}: {
  state: LeadModalState;
  onClose: () => void;
}) {
  if (!state) {
    return null;
  }

  const isEdit = state.mode === "edit";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#06150B]/40 px-4 py-5 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_30px_100px_rgba(6,21,11,0.28)] sm:p-6"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#65C22E]">{isEdit ? "Edit lead" : "Lead details"}</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-normal text-[#0F5A24]">{state.lead.customer}</h2>
            <p className="mt-1 text-sm font-semibold text-[#405244]/64">{state.lead.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lead panel"
            className="flex size-10 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#0F5A24] transition hover:bg-[#E8F7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            <X className="size-5" />
          </button>
        </div>

        {isEdit ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Customer", state.lead.customer],
              ["Email", state.lead.email],
              ["Address", state.lead.address],
              ["Dogs", state.lead.dogs],
            ].map(([label, value]) => (
              <label key={label} className="grid gap-2">
                <span className="text-xs font-extrabold uppercase text-[#405244]/54">{label}</span>
                <input
                  defaultValue={value}
                  className="h-12 rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-4 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
                />
              </label>
            ))}
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase text-[#405244]/54">Service</span>
              <select
                defaultValue={state.lead.service}
                className="h-12 rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-4 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
              >
                <option>Weekly Service</option>
                <option>One Time Service</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase text-[#405244]/54">Status</span>
              <select
                defaultValue={state.lead.status}
                className="h-12 rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-4 text-sm font-bold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
              >
                {allStatusOptions.filter((status) => status !== "All").map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Service", state.lead.service],
              ["Dogs", state.lead.dogs],
              ["Address", state.lead.address],
              ["Status", state.lead.status],
              ["Submitted", state.lead.submitted],
              ["Next step", state.lead.status === "New Lead" ? "Call customer today" : "Keep status updated"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F8FAFC] p-4">
                <p className="text-xs font-extrabold uppercase text-[#405244]/48">{label}</p>
                <p className="mt-1 text-sm font-extrabold text-[#12321C]">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl border border-[#0F5A24]/12 bg-white px-5 text-sm font-extrabold text-[#0F5A24] transition hover:bg-[#FFF8E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            Close
          </button>
          {isEdit ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#65C22E] px-5 text-sm font-extrabold text-[#073516] shadow-[0_16px_40px_rgba(101,194,46,0.26)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
            >
              <Save className="size-4" />
              Save Mock Changes
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function LeadsView({
  searchTerm,
  statusFilter,
  serviceFilter,
  onSearchChange,
  onStatusChange,
  onServiceChange,
  onViewLead,
  onEditLead,
}: {
  searchTerm: string;
  statusFilter: LeadStatus | "All";
  serviceFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "All") => void;
  onServiceChange: (value: string) => void;
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [lead.customer, lead.email, lead.address, lead.service, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchesService = serviceFilter === "All" || lead.service === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <>
      <SectionSummary
        title="Lead Management"
        copy="A frontend-only lead workspace for reviewing incoming service requests, prioritizing callbacks, and keeping every request moving."
        stats={[
          { label: "Awaiting review", value: "24" },
          { label: "Contacted", value: "18" },
          { label: "Scheduled", value: "36" },
        ]}
      />
      <LeadFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        serviceFilter={serviceFilter}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onServiceChange={onServiceChange}
        resultCount={filteredLeads.length}
      />
      <RecentLeads
        items={filteredLeads}
        showViewAll={false}
        onViewLead={onViewLead}
        onEditLead={onEditLead}
      />
      <section className="grid gap-4 md:grid-cols-3">
        {["New Lead", "Contacted", "Scheduled"].map((status) => (
          <motion.article
            key={status}
            {...cardMotion}
            className="rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,90,36,0.07)]"
          >
            <p className="text-sm font-extrabold text-[#405244]/58">{status}</p>
            <p className="mt-2 font-heading text-3xl font-extrabold tracking-normal text-[#0F5A24]">
              {leads.filter((lead) => lead.status === status).length || (status === "New Lead" ? 24 : status === "Contacted" ? 18 : 36)}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#405244]/64">
              Mock pipeline count for current service requests.
            </p>
          </motion.article>
        ))}
      </section>
    </>
  );
}

function CustomersView() {
  const customers = leads.filter((lead) => lead.service === "Weekly Service");

  return (
    <>
      <SectionSummary
        title="Weekly Customers"
        copy="A mock customer hub for recurring service accounts, route planning, and high-priority follow-up."
        stats={[
          { label: "Active weekly", value: "62" },
          { label: "Routes today", value: "8" },
          { label: "Retention", value: "94%" },
        ]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <motion.article
            key={customer.email}
            {...cardMotion}
            className="rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,90,36,0.08)] transition hover:-translate-y-1 hover:border-[#65C22E]/25 hover:shadow-[0_24px_70px_rgba(15,90,36,0.13)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">{customer.customer}</h2>
                <p className="mt-1 text-sm font-semibold text-[#405244]/62">{customer.address}</p>
              </div>
              <span className="rounded-full bg-[#E8F7DF] px-3 py-1 text-xs font-extrabold text-[#0F5A24]">
                {customer.dogs} dogs
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm font-bold text-[#405244]/70">
              <p>Service: {customer.service}</p>
              <p>Next route: Thursday morning</p>
              <p>Access notes: Gate access on file</p>
            </div>
          </motion.article>
        ))}
      </section>
    </>
  );
}

function ReportsView() {
  return (
    <>
      <SectionSummary
        title="Reports"
        copy="Mock reporting panels for understanding demand, route volume, and lead conversion without connecting analytics yet."
        stats={[
          { label: "Monthly revenue", value: "$8.4k" },
          { label: "Jobs completed", value: "91" },
          { label: "Conversion", value: "68%" },
        ]}
      />
      <BusinessOverview />
      <section className="grid gap-4 md:grid-cols-3">
        {["Ashburn", "Leesburg", "Sterling"].map((area, index) => (
          <motion.article
            key={area}
            {...cardMotion}
            className="rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,90,36,0.07)]"
          >
            <p className="text-sm font-extrabold text-[#405244]/58">{area}</p>
            <p className="mt-2 font-heading text-3xl font-extrabold tracking-normal text-[#0F5A24]">
              {[38, 27, 21][index]}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#405244]/64">
              Completed service visits this month.
            </p>
          </motion.article>
        ))}
      </section>
    </>
  );
}

function SettingsView() {
  const [pricing, setPricing] = useState({
    firstVisit: "100",
    weekly: "25",
    extraDog: "5",
  });
  const [saved, setSaved] = useState(false);

  const updatePrice = (field: keyof typeof pricing, value: string) => {
    setSaved(false);
    setPricing((current) => ({ ...current, [field]: value }));
  };

  return (
    <>
      <SectionSummary
        title="Settings"
        copy="Frontend-only controls for the future admin experience. These settings are visual placeholders until backend preferences are connected."
        stats={[
          { label: "Admin users", value: "2" },
          { label: "Notifications", value: "On" },
          { label: "Mode", value: "Mock" },
        ]}
      />
      <motion.section
        {...cardMotion}
        className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_18px_55px_rgba(15,90,36,0.07)]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
              <DollarSign className="size-6" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-extrabold tracking-normal text-[#0F5A24]">Pricing</h2>
              <p className="mt-1 text-sm font-semibold text-[#405244]/62">Edit the service pricing shown in the admin mockup.</p>
            </div>
          </div>
          {saved ? (
            <span className="rounded-full bg-[#E8F7DF] px-4 py-2 text-sm font-extrabold text-[#0F5A24]">
              Mock pricing saved
            </span>
          ) : null}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["firstVisit", "First Visit", pricing.firstVisit],
            ["weekly", "Weekly", pricing.weekly],
            ["extraDog", "Extra Dog", pricing.extraDog],
          ].map(([field, label, value]) => (
            <label key={field} className="grid gap-2">
              <span className="text-sm font-extrabold text-[#12321C]">{label}</span>
              <span className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#0F5A24]/52">$</span>
                <input
                  inputMode="numeric"
                  value={value}
                  onChange={(event) => updatePrice(field as keyof typeof pricing, event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#0F5A24]/10 bg-[#F8FAFC] px-8 text-sm font-extrabold text-[#12321C] outline-none transition focus:border-[#65C22E]/70 focus:ring-4 focus:ring-[#65C22E]/14"
                />
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#65C22E] px-6 text-sm font-extrabold text-[#073516] shadow-[0_16px_40px_rgba(101,194,46,0.26)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            <Save className="size-4" />
            Save
          </button>
        </div>
      </motion.section>
      <section className="grid gap-5 xl:grid-cols-2">
        {[
          ["Business profile", "Dog Poop People", "Loudoun County, VA"],
          ["Lead rules", "Dog areas up to 1/4 acre", "Weekly and one-time service"],
          ["Notifications", "New request alerts enabled", "Daily summary at 8:00 AM"],
          ["Portal access", "Authorized administrators only", "Authentication will be added later"],
        ].map(([title, primary, secondary]) => (
          <motion.article
            key={title}
            {...cardMotion}
            className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_18px_55px_rgba(15,90,36,0.07)]"
          >
            <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">{title}</h2>
            <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-sm font-extrabold text-[#12321C]">{primary}</p>
              <p className="mt-1 text-sm font-semibold text-[#405244]/62">{secondary}</p>
            </div>
          </motion.article>
        ))}
      </section>
    </>
  );
}

function TasksAndActivity() {
  const [checked, setChecked] = useState(() => tasks.map((task) => task.done));

  return (
    <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <motion.article {...cardMotion} className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_20px_70px_rgba(15,90,36,0.08)]">
        <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Today&apos;s Tasks</h2>
        <div className="mt-5 grid gap-3">
          {tasks.map((task, index) => (
            <label key={task.label} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 transition hover:bg-[#F3F8F1]">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() =>
                  setChecked((current) =>
                    current.map((value, valueIndex) => (valueIndex === index ? !value : value)),
                  )
                }
                className="size-5 rounded border-[#0F5A24]/20 accent-[#65C22E]"
              />
              <span className={cn("text-sm font-extrabold", checked[index] ? "text-[#405244]/46 line-through" : "text-[#12321C]")}>
                {task.label}
              </span>
            </label>
          ))}
        </div>
      </motion.article>

      <motion.article {...cardMotion} className="rounded-2xl border border-[#0F5A24]/8 bg-white p-6 shadow-[0_20px_70px_rgba(15,90,36,0.08)]">
        <h2 className="font-heading text-xl font-extrabold tracking-normal text-[#0F5A24]">Recent Activity</h2>
        <div className="mt-6 grid gap-5">
          {activity.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative flex gap-4">
                {index < activity.length - 1 ? <span className="absolute left-5 top-11 h-full w-px bg-[#0F5A24]/10" /> : null}
                <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#12321C]">{item.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#405244]/64">{item.detail}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#405244]/46">
                    <Clock3 className="size-3.5" />
                    {item.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.article>
    </section>
  );
}

function MockNotice({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-x-4 bottom-5 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-[#0F5A24]/8 bg-white p-4 text-[#12321C] shadow-[0_24px_80px_rgba(15,90,36,0.18)] sm:left-auto sm:right-5"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
        <FileDown className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-[#0F5A24]">Mock action complete</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#405244]/68">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#0F5A24] transition hover:bg-[#E8F7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [leadModal, setLeadModal] = useState<LeadModalState>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mockNotice, setMockNotice] = useState<string | null>(null);
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | "All">("All");
  const [leadServiceFilter, setLeadServiceFilter] = useState("All");

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/admin/login" });
  };

  const showLeads = (status: LeadStatus | "All" = "All") => {
    setLeadStatusFilter(status);
    setLeadServiceFilter("All");
    setLeadSearchTerm("");
    setActiveSection("Leads");
  };

  const handleAddLead = () => {
    setLeadModal({
      mode: "edit",
      lead: {
        customer: "New Mock Lead",
        email: "new.customer@example.com",
        service: "Weekly Service",
        dogs: "1",
        address: "Loudoun County, VA",
        status: "New Lead",
        submitted: "Just now",
      },
    });
  };

  const handleExportLeads = () => {
    setMockNotice("Leads export prepared as a frontend-only mock action.");
  };

  return (
    <main className="min-h-dvh bg-[#F8FAFC] font-sans text-[#12321C]">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} onLogout={handleLogout} />
      <MobileNav activeSection={activeSection} onSelect={setActiveSection} onLogout={handleLogout} />
      <div className="min-w-0 lg:pl-[280px]">
        <div className="mx-auto grid min-w-0 max-w-[1560px] gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <DashboardHeader
            activeSection={activeSection}
            notificationOpen={notificationOpen}
            onToggleNotifications={() => setNotificationOpen((open) => !open)}
          />
          {activeSection === "Dashboard" ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {stats.map((stat, index) => (
                  <StatCardView key={stat.label} stat={stat} index={index} />
                ))}
              </section>
              <RecentLeads
                onViewAll={() => showLeads("All")}
                onViewLead={(lead) => setLeadModal({ lead, mode: "view" })}
                onEditLead={(lead) => setLeadModal({ lead, mode: "edit" })}
              />
              <QuickActions
                onAddLead={handleAddLead}
                onReviewRequests={() => showLeads("New Lead")}
                onViewCustomers={() => setActiveSection("Customers")}
                onExportLeads={handleExportLeads}
              />
              <BusinessOverview />
              <TasksAndActivity />
            </>
          ) : null}
          {activeSection === "Leads" ? (
            <LeadsView
              searchTerm={leadSearchTerm}
              statusFilter={leadStatusFilter}
              serviceFilter={leadServiceFilter}
              onSearchChange={setLeadSearchTerm}
              onStatusChange={setLeadStatusFilter}
              onServiceChange={setLeadServiceFilter}
              onViewLead={(lead) => setLeadModal({ lead, mode: "view" })}
              onEditLead={(lead) => setLeadModal({ lead, mode: "edit" })}
            />
          ) : null}
          {activeSection === "Customers" ? <CustomersView /> : null}
          {activeSection === "Reports" ? <ReportsView /> : null}
          {activeSection === "Settings" ? <SettingsView /> : null}
        </div>
      </div>
      <LeadModal state={leadModal} onClose={() => setLeadModal(null)} />
      <MockNotice message={mockNotice} onClose={() => setMockNotice(null)} />
    </main>
  );
}

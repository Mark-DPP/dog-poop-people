import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { LeadStatus, ServiceType } from "@/lib/generated/prisma/enums";

export const pageSize = 12;

export async function getDashboardData() {
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    scheduledJobs,
    completedJobs,
    weeklyCustomers,
    contactMessages,
    recentLeads,
    recentActivity,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW_LEAD" } }),
    prisma.lead.count({ where: { status: "CONTACTED" } }),
    prisma.lead.count({ where: { status: "SCHEDULED" } }),
    prisma.lead.count({ where: { status: "COMPLETED" } }),
    prisma.lead.count({
      where: {
        serviceType: "WEEKLY",
        status: { in: ["SCHEDULED", "COMPLETED"] },
      },
    }),
    prisma.contactMessage.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.adminActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const conversionRate =
    totalLeads > 0 ? ((scheduledJobs + completedJobs) / totalLeads) * 100 : 0;

  return {
    stats: {
      totalLeads,
      newLeads,
      contactedLeads,
      scheduledJobs,
      completedJobs,
      weeklyCustomers,
      contactMessages,
      conversionRate,
    },
    recentLeads,
    recentActivity,
  };
}

export async function getLeads({
  search,
  status,
  serviceType,
  page,
}: {
  search?: string;
  status?: LeadStatus | "ALL";
  serviceType?: ServiceType | "ALL";
  page: number;
}) {
  const where = {
    ...(status && status !== "ALL" ? { status } : {}),
    ...(serviceType && serviceType !== "ALL" ? { serviceType } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            {
              propertyAddress: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function getContactMessages({
  page,
}: {
  page: number;
}) {
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count(),
  ]);

  return {
    items,
    total,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getWeeklyCustomers() {
  return prisma.lead.findMany({
    where: {
      serviceType: "WEEKLY",
      status: { in: ["SCHEDULED", "COMPLETED"] },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getReportsData() {
  const [
    totalLeads,
    contactMessages,
    leadsByStatus,
    leadsByServiceType,
    completedJobs,
    notQualifiedLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.contactMessage.count(),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.lead.groupBy({
      by: ["serviceType"],
      _count: { serviceType: true },
    }),
    prisma.lead.count({ where: { status: "COMPLETED" } }),
    prisma.lead.count({ where: { status: "NOT_QUALIFIED" } }),
  ]);

  return {
    totalLeads,
    contactMessages,
    leadsByStatus,
    leadsByServiceType,
    completedJobs,
    notQualifiedLeads,
  };
}


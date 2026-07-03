import type { Metadata } from "next";

import { ContactMessageStatusForm } from "@/components/admin/admin-action-forms";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminCard,
  EmptyState,
  Pagination,
  StatusBadge,
} from "@/components/admin/admin-primitives";
import { getContactMessages } from "@/lib/admin/data";
import { contactMessageStatusLabels, formatDateTime } from "@/lib/admin/format";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Messages | Dog Poop People Admin",
};

type SearchParams = Promise<{ page?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminUser("/admin/messages");
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const messages = await getContactMessages({ page });

  return (
    <AdminShell
      title="Messages"
      subtitle="Review real contact form submissions and archive completed threads."
    >
      <AdminCard>
        <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
          Contact Messages
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#405244]/64">
          {messages.total} total messages.
        </p>

        <div className="mt-5 grid gap-4">
          {messages.items.length > 0 ? (
            messages.items.map((message) => (
              <article key={message.id} className="rounded-2xl bg-[#F8FAFC] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-heading text-xl font-extrabold text-[#0F5A24]">
                      {message.fullName}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[#405244]/70">
                      {message.email}
                      {message.phone ? ` · ${message.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#65C22E]">
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  <StatusBadge label={contactMessageStatusLabels[message.status]} />
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-7 text-[#405244]">
                  {message.message}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ContactMessageStatusForm
                    id={message.id}
                    status="READ"
                    label="Mark Read"
                  />
                  <ContactMessageStatusForm
                    id={message.id}
                    status="ARCHIVED"
                    label="Archive"
                    confirmMessage="Archive this message?"
                  />
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No messages yet" copy="Contact form messages will appear here." />
          )}
        </div>
      </AdminCard>
      <Pagination
        page={page}
        pageCount={messages.pageCount}
        basePath="/admin/messages"
        params={new URLSearchParams()}
      />
    </AdminShell>
  );
}


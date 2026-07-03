import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#0F5A24]/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,90,36,0.07)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] px-4 py-10 text-center">
      <p className="font-heading text-xl font-extrabold text-[#0F5A24]">{title}</p>
      <p className="mt-2 text-sm font-semibold text-[#405244]/64">{copy}</p>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "green" | "blue" | "orange" | "purple" | "red" | "slate";
}) {
  const styles = {
    default: "bg-[#E8F7DF] text-[#0F5A24] ring-[#65C22E]/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1", styles[tone])}>
      {label}
    </span>
  );
}

export function AdminLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-full bg-[#0F5A24] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#16692D]"
    >
      {children}
    </Link>
  );
}

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: URLSearchParams;
}) {
  const makeHref = (nextPage: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(nextPage));
    return `${basePath}?${nextParams.toString()}`;
  };

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-bold text-[#405244]/64">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 ? <AdminLink href={makeHref(page - 1)}>Previous</AdminLink> : null}
        {page < pageCount ? <AdminLink href={makeHref(page + 1)}>Next</AdminLink> : null}
      </div>
    </div>
  );
}


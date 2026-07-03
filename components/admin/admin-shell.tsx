"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: ClipboardList },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Customers", href: "/admin/customers", icon: UsersRound },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <main className="min-h-dvh bg-[#F6F8F2] text-[#12321C]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#0F5A24]/8 bg-white/95 px-5 py-6 shadow-[18px_0_60px_rgba(15,90,36,0.07)] lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Dog Poop People"
            width={58}
            height={54}
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="font-heading text-lg font-extrabold text-[#0F5A24]">
              Dog Poop People
            </p>
            <p className="text-xs font-bold uppercase text-[#405244]/48">
              Admin CRM
            </p>
          </div>
        </Link>

        <nav className="mt-10 grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70",
                  isActive
                    ? "bg-[#0F5A24] text-white shadow-[0_18px_45px_rgba(15,90,36,0.22)]"
                    : "text-[#405244]/78 hover:-translate-y-0.5 hover:bg-[#F3F8F1] hover:text-[#0F5A24]",
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    isActive
                      ? "text-[#65C22E]"
                      : "text-[#0F5A24]/52 group-hover:text-[#65C22E]",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/admin/login" })}
            className="group flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold text-[#405244]/78 transition duration-300 hover:-translate-y-0.5 hover:bg-[#F3F8F1] hover:text-[#0F5A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65C22E]/70"
          >
            <LogOut className="size-5 text-[#0F5A24]/52 group-hover:text-[#65C22E]" />
            Logout
          </button>
        </nav>

        <div className="absolute inset-x-5 bottom-6 flex items-center justify-between rounded-2xl border border-[#0F5A24]/8 bg-white px-4 py-3 shadow-[0_14px_38px_rgba(15,90,36,0.08)]">
          <div>
            <p className="text-sm font-extrabold text-[#0F5A24]">Admin profile</p>
            <p className="mt-0.5 text-xs font-bold text-[#405244]/52">
              Clerk account
            </p>
          </div>
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: "size-10" } }}
          />
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-[#0F5A24]/8 bg-white/94 px-4 py-3 shadow-[0_10px_34px_rgba(15,90,36,0.06)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Dog Poop People"
              width={44}
              height={42}
              className="h-10 w-auto"
            />
            <span className="font-heading text-base font-extrabold text-[#0F5A24]">
              Admin Portal
            </span>
          </Link>
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: "size-10" } }}
          />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold shadow-sm transition",
                  isActive ? "bg-[#0F5A24] text-white" : "bg-[#F1F5F9] text-[#405244]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="lg:pl-[280px]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header>
            <p className="text-sm font-extrabold uppercase text-[#65C22E]">
              Admin
            </p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold text-[#0F5A24] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#405244]/70">
              {subtitle}
            </p>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}


import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";
import { requireAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Settings | Dog Poop People Admin",
};

export default async function Page() {
  await requireAdminUser("/admin/settings");

  const rules = [
    ["First Visit", "$100"],
    ["Weekly Service", "$25"],
    ["Extra Dog", "$5"],
    ["Service Area", "Loudoun County, VA"],
    ["Max Yard Size", "1/4 acre"],
  ];

  return (
    <AdminShell
      title="Settings"
      subtitle="Business rules are shown here for now; editable settings can come later."
    >
      <AdminCard>
        <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
          Current Business Rules
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rules.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[#F8FAFC] p-5">
              <p className="text-xs font-extrabold uppercase text-[#405244]/48">
                {label}
              </p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-[#0F5A24]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>
    </AdminShell>
  );
}


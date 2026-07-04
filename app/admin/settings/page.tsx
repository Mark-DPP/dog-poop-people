import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdminUser } from "@/lib/auth/admin";
import { getBusinessSettings } from "@/lib/settings/business-settings";
import { formatCurrency } from "@/lib/settings/pricing";

export const metadata: Metadata = {
  title: "Settings | Dog Poop People Admin",
};

export default async function Page() {
  await requireAdminUser("/admin/settings");
  const settings = await getBusinessSettings();

  const rules = [
    ["First Visit", formatCurrency(settings.firstVisitCents)],
    ["Weekly Service", formatCurrency(settings.weeklyServiceCents)],
    ["Extra Dog", formatCurrency(settings.extraDogCents)],
    ["Service Area", settings.serviceArea],
    ["Max Yard Size", settings.maxYardSize],
  ];

  return (
    <AdminShell
      title="Settings"
      subtitle="Update the pricing and qualification rules customers see when requesting service."
    >
      <div className="grid gap-6">
        <AdminCard>
          <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
            Customer-Facing Rules
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {rules.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F8FAFC] p-5">
                <p className="text-xs font-extrabold uppercase text-[#405244]/48">
                  {label}
                </p>
                <p className="mt-2 break-words font-heading text-2xl font-extrabold text-[#0F5A24]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-heading text-xl font-extrabold text-[#0F5A24]">
            Edit Settings
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#405244]/64">
            Changes save to the site settings and update the service request page.
          </p>
          <div className="mt-6">
            <SettingsForm settings={settings} />
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

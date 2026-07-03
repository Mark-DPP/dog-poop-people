import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";

export default function Loading() {
  return (
    <AdminShell title="Settings" subtitle="Loading settings...">
      <AdminCard>
        <div className="h-48 animate-pulse rounded-2xl bg-[#F1F5F9]" />
      </AdminCard>
    </AdminShell>
  );
}


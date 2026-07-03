import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";

export default function Loading() {
  return (
    <AdminShell title="Reports" subtitle="Loading reports...">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminCard key={index}>
            <div className="h-24 animate-pulse rounded-2xl bg-[#F1F5F9]" />
          </AdminCard>
        ))}
      </section>
    </AdminShell>
  );
}


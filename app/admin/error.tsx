"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminShell title="Admin" subtitle="Something went wrong loading admin data.">
      <AdminCard>
        <p className="font-heading text-xl font-extrabold text-[#B42318]">
          Admin data could not be loaded.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#405244]/70">
          Check the database connection and try again.
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try Again
        </Button>
      </AdminCard>
    </AdminShell>
  );
}


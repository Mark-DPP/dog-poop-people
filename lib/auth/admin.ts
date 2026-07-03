import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { upsertAdminUser } from "@/lib/db/admin-users";

type MetadataWithRole = {
  role?: unknown;
};

function hasAdminRole(metadata: unknown) {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    (metadata as MetadataWithRole).role === "admin"
  );
}

export async function requireAdminUser() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/admin/login?redirect_url=%2Fadmin%2Fdashboard");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const isAdmin =
    hasAdminRole(user.publicMetadata) || hasAdminRole(user.privateMetadata);

  if (!isAdmin) {
    redirect("/admin/login?error=unauthorized");
  }

  await upsertAdminUser(user);

  return user;
}

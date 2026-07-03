import type { Metadata } from "next";

import { AdminLoginPage } from "@/components/admin/admin-login-page";
import { resolveRedirectTarget } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Admin Login | Dog Poop People",
  description: "Dog Poop People administrator login.",
};

type LoginSearchParams = Promise<{
  error?: string | string[];
  redirect_url?: string | string[];
}>;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const redirectUrl = getFirstParam(params.redirect_url);
  const error = getFirstParam(params.error);

  if (redirectUrl) {
    query.set("redirect_url", redirectUrl);
  }

  return (
    <AdminLoginPage
      initialMessage={error === "unauthorized" ? "You are not admin." : null}
      initialRedirectTarget={resolveRedirectTarget(query)}
    />
  );
}

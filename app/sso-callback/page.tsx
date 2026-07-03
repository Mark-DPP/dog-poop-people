"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/admin/dashboard"
        signUpFallbackRedirectUrl="/admin/dashboard"
      />
      <div id="clerk-captcha" />
    </>
  );
}

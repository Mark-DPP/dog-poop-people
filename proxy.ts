import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { buildAuthRedirectPath } from "@/lib/auth/redirects";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isAdminLoginRoute = createRouteMatcher(["/admin/login(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { isAuthenticated } = await auth();
    const isUnauthorizedAdminLogin =
      isAdminLoginRoute(req) && req.nextUrl.searchParams.get("error") === "unauthorized";

    if (isAdminLoginRoute(req) && isAuthenticated && !isUnauthorizedAdminLogin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (!isAdminRoute(req) || isAdminLoginRoute(req)) {
      return;
    }

    if (!isAuthenticated) {
      const redirectPath = buildAuthRedirectPath(
        "/admin/login",
        req.nextUrl.pathname,
        req.nextUrl.search,
      );

      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  },
  {
    signInUrl: "/admin/login",
    signUpUrl: "/admin/login",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};

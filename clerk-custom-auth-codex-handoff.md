# Clerk Custom Auth Implementation Handoff for Codex

Use this file as the assignment brief for the Codex agent working in the new project.

## IMPORTANT: Auth is only for admin users!

This website will have authentication *only for admin users*. Regular users will not need to sign in or sign up. Build the authentication system for admin only.

The new project already has custom login and signup UI pages. Keep that custom UI. Build the authentication system underneath it with Clerk, backend route protection (for admin routes only), database user linking, SSO callback handling, and Continue with Google. Do not replace the UI with Clerk's prebuilt `<SignIn />` or `<SignUp />` components unless the user explicitly asks.

## Non-Negotiables

- Clerk remains the source of truth for identities, passwords, email verification, OAuth, sessions, MFA, and password reset.
- Do not build or store a custom password table. Do not hash passwords yourself unless the user explicitly changes the requirement away from Clerk.
- Do not expose or print secrets. Never paste `.env` values into chat or logs.
- If a required Clerk key, webhook signing secret, database URL, domain, redirect URL, or dashboard setting is missing, stop and ask the user before proceeding with that part.
- Prefer asking the user to add secrets to `.env.local` or their deployment environment, then confirm the variable names, rather than asking them to paste secret values.
- Preserve the existing UI, route names, design system, and app architecture unless there is a clear auth reason to change them.
- Validate every redirect target. Only allow safe same-origin relative paths such as `/admin`; reject external URLs and protocol-relative URLs like `//evil.example`.
- Make webhook handlers public in middleware but verify their signatures server-side.
- Finish with tests, typecheck/build, and a manual QA checklist for admin email/password, Google OAuth, protected admin redirects, logout, and password reset.

## Current Working Reference: Textora-AI

This working project uses:

- Next.js App Router with React client auth pages.
- `@clerk/nextjs` v7 / Clerk Core 3 style custom flows.
- Prisma/PostgreSQL with a local user table keyed by Clerk user ID.
- Custom `/login`, `/signup`, `/forgot-password`, and `/sso-callback` pages.
- Clerk middleware for route protection.

Important reference patterns from Textora-AI:

- `app/layout.tsx` wraps the app with `<ClerkProvider>`.
- `middleware.ts` declares public routes, auth routes, and protects all other routes with `auth.protect()`.
- `app/login/page.tsx` uses `useSignIn().signIn.password(...)`, handles `needs_second_factor` / `needs_client_trust`, calls `signIn.finalize(...)`, and starts Google with `signIn.sso({ strategy: 'oauth_google', redirectCallbackUrl: '/sso-callback', redirectUrl })`.
- `app/signup/page.tsx` uses `useSignUp().signUp.password(...)`, sends email verification with `signUp.verifications.sendEmailCode()`, verifies with `signUp.verifications.verifyEmailCode({ code })`, calls `signUp.finalize(...)`, includes `<div id="clerk-captcha" />`, and starts Google with `signUp.sso(...)`.
- `app/sso-callback/page.tsx` renders `<AuthenticateWithRedirectCallback />` with sign-in and sign-up fallback/force redirect URLs. This is simpler and safer than hand-rolling every OAuth callback state.
- `app/forgot-password/page.tsx` uses `useSignIn()` with `signIn.create({ identifier })`, `signIn.resetPasswordEmailCode.sendCode()`, `verifyCode({ code })`, `submitPassword({ password })`, and `signIn.finalize(...)`.
- `lib/auth/client-flow.ts` contains safe redirect helpers.
- `lib/auth/clerk-errors.ts` maps Clerk error codes to safe user-facing messages instead of showing raw Clerk internals.
- `lib/server-user.ts` uses `auth()` and `currentUser()` from `@clerk/nextjs/server` to require a signed-in viewer.
- `lib/usage-tracker.ts` lazily upserts the local `TrackedUser` by `clerkUserId`.
- `prisma/schema.prisma` has `TrackedUser.clerkUserId String @unique`, plus app-specific fields.

Textora-AI currently uses on-demand database upserts when backend work needs a local user. It does not appear to have a Clerk user-sync webhook. In the new project, choose between:

- On-demand upsert only, if user rows are only needed after authenticated app activity.
- Clerk webhook sync, if the database must contain or update users immediately after `user.created`, `user.updated`, or `user.deleted`.

For production systems with app-specific profiles, billing, analytics, roles, onboarding, or admin dashboards, prefer adding Clerk webhooks plus keeping on-demand upsert as a backstop.

## Official Clerk References To Recheck

Before implementing, verify the latest official Clerk docs because the SDK changes over time:

- Next.js middleware and `auth.protect()`: https://clerk.com/docs/reference/nextjs/clerk-middleware
- Server `auth()` helper: https://clerk.com/docs/reference/nextjs/app-router/auth
- Custom email/password flow: https://clerk.com/docs/guides/development/custom-flows/authentication/email-password
- Custom OAuth flow: https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections
- `<AuthenticateWithRedirectCallback />`: https://clerk.com/docs/component-reference/authenticate-with-redirect-callback
- Forgot password custom flow: https://clerk.com/docs/guides/development/custom-flows/account-updates/forgot-password
- Clerk environment variables: https://clerk.com/docs/guides/development/clerk-environment-variables
- Sync Clerk data with webhooks: https://clerk.com/docs/guides/development/webhooks/syncing

## First Action: Audit The New Project

Before editing, inspect the new project and write down:

- Framework and router: Next.js App Router, Pages Router, Vite, Remix, Express, etc.
- Package manager and scripts.
- Existing auth UI routes and file paths.
- Existing backend/API route structure.
- Existing database/ORM, schema, migrations, and user/account tables.
- Existing `.env.example` variables. Do not print real `.env` values.
- Current protected pages and API endpoints.
- Desired post-login destination.
- Whether signup requires name, username, accepted terms, organization, role, or other custom profile fields.
- Whether the app needs immediate DB user sync after signup or only lazy creation on first protected action.

Then implement using the app's existing conventions.

## Ask The User Before Proceeding If Missing

Ask concise questions before implementing any part that depends on unavailable configuration:

- "Do you already have a Clerk application for this project, or should this use a new Clerk app?"
- "Please add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`; confirm when done."
- "Is Google enabled as a social connection in Clerk Dashboard for both development and production?"
- "What are the allowed development and production domains?"
- "What should the sign-in, sign-up, and after-auth redirect paths be?"
- "Do you want database users synced immediately via Clerk webhooks? If yes, please add `CLERK_WEBHOOK_SIGNING_SECRET` after creating the webhook endpoint in Clerk Dashboard."
- "What database connection variable should be used, and is it safe for me to run migrations?"
- "Should admin roles live in Clerk public metadata, private metadata, organization roles, or the app database?"
- "Are there legal requirements at signup, such as accepting Terms of Service or Privacy Policy?"

Do not block on optional dashboard items if you can still scaffold code safely. For example, you can create `.env.example`, helper functions, and route skeletons while waiting for actual keys, but do not claim end-to-end auth is verified until keys and dashboard configuration are present.

## Environment Variables

For a Next.js project, expect at least:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/admin
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/admin
CLERK_WEBHOOK_SIGNING_SECRET=
DATABASE_URL=
```

Only include `CLERK_WEBHOOK_SIGNING_SECRET` if implementing Clerk webhooks. Keep actual values out of committed files. Add placeholders to `.env.example`.

## Clerk Dashboard Requirements

Confirm or ask the user to configure:

- Email sign-up enabled.
- Email sign-in enabled.
- Password sign-up enabled if the custom UI has password fields.
- Email verification code enabled for sign-up if the UI verifies codes.
- Password reset by email code enabled if the UI has forgot password.
- Google social connection enabled for Continue with Google.
- Development and production domains configured.
- Redirect/callback behavior supports the app's `/sso-callback` route.
- Bot protection/captcha settings are compatible with the signup page. If Clerk bot protection is enabled, include `<div id="clerk-captcha" />` on custom signup and relevant callback/continue pages.
- If using webhooks, create an endpoint for `user.created`, `user.updated`, and `user.deleted`, then add `CLERK_WEBHOOK_SIGNING_SECRET`.

## Implementation Plan

1. Install or verify Clerk SDK.

```bash
npm install @clerk/nextjs
```

Use the project's package manager. If dependencies must be downloaded and network access is blocked, request approval.

2. Add the provider.

For Next.js App Router, wrap the root layout:

```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

3. Add middleware.

Protect ONLY admin routes and admin API endpoints by default. All other routes (public pages, etc.) should be accessible to everyone without authentication.

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  // Public pages (all user-facing pages go here)
  '/(.*)', // This makes all routes public by default
  '/login(.*)',
  '/signup(.*)',
  '/forgot-password(.*)',
  '/sso-callback(.*)',
  '/api/webhooks/clerk(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)', // All admin routes start with /admin
  '/api/admin(.*)', // All admin API routes start with /api/admin
])

const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/forgot-password(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Only protect admin routes
  if (isAdminRoute(req)) {
    await auth.protect()
    // TODO: Add admin role check here (e.g., check if user has ADMIN role in database or Clerk metadata)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
```

Ensure that only admin routes are protected. All other routes should be public. Add admin role verification (e.g., check that the user has `ADMIN` role in database or Clerk metadata).

4. Add safe redirect helpers.

```ts
export function resolveRedirectTarget(search: URLSearchParams | string | null | undefined, fallback = '/') {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search

  const candidate = params?.get('redirect_url')?.trim()

  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback
  }

  return candidate
}

export function buildAuthRedirectPath(basePath: '/login' | '/signup', currentPath: string, currentSearch = '') {
  const normalizedSearch =
    currentSearch.length === 0 ? '' : currentSearch.startsWith('?') ? currentSearch : `?${currentSearch}`

  return `${basePath}?redirect_url=${encodeURIComponent(`${currentPath}${normalizedSearch}`)}`
}
```

5. Wire custom login UI to Clerk.

Use the existing form. On submit:

- Call `signIn.password({ emailAddress, password })`.
- If `signIn.status === 'complete'`, call `signIn.finalize({ navigate })`.
- If `needs_second_factor` or `needs_client_trust`, show the app's MFA verification state.
- For email code MFA/client trust, call `signIn.mfa.sendEmailCode()` and verify with `signIn.mfa.verifyEmailCode({ code })`.
- Use safe error mapping. Do not show raw Clerk error objects to users.
- Disable submit while `fetchStatus === 'fetching'`.

For Continue with Google on login:

```ts
await signIn.sso({
  strategy: 'oauth_google',
  redirectCallbackUrl: '/sso-callback',
  redirectUrl: redirectTarget,
})
```

6. Wire custom signup UI to Clerk.

Use the existing form. On submit:

- Collect only fields the UI already asks for and the Clerk Dashboard requires.
- Call `signUp.password({ emailAddress, password, firstName, lastName })` when those fields exist.
- If complete, call `signUp.finalize({ navigate })`.
- If email verification is required, call `signUp.verifications.sendEmailCode()`.
- Show a verification-code state when `signUp.status === 'missing_requirements'`, `unverifiedFields` includes `email_address`, and no other `missingFields` remain.
- Verify with `signUp.verifications.verifyEmailCode({ code })`.
- Include `<div id="clerk-captcha" />`.
- If `signUp.isTransferable`, guide the user to log in or transfer according to Clerk's current docs.

For Continue with Google on signup:

```ts
await signUp.sso({
  strategy: 'oauth_google',
  redirectCallbackUrl: '/sso-callback',
  redirectUrl: redirectTarget,
})
```

7. Add the SSO callback page.

For Next.js App Router:

```tsx
'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

import { resolveRedirectTarget } from '@/lib/auth/client-flow'

export default function SSOCallbackPage() {
  const searchParams = useSearchParams()
  const redirectTarget = resolveRedirectTarget(searchParams, '/dashboard')

  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={redirectTarget}
        signUpFallbackRedirectUrl={redirectTarget}
        signInForceRedirectUrl={redirectTarget}
        signUpForceRedirectUrl={redirectTarget}
      />
      <div id="clerk-captcha" />
    </>
  )
}
```

If the Clerk Dashboard requires extra signup fields for OAuth users, add a continue page and pass `continueSignUpUrl` to `<AuthenticateWithRedirectCallback />`.

If this callback page uses `useSearchParams()` in a Next.js App Router route, wrap the page content in `<Suspense>` or follow the framework's current requirement for client-side search params.

8. Add forgot password if the UI exists.

Flow:

- `signIn.create({ identifier: emailAddress })`
- `signIn.resetPasswordEmailCode.sendCode()`
- `signIn.resetPasswordEmailCode.verifyCode({ code })`
- When `signIn.status === 'needs_new_password'`, collect a new password.
- `signIn.resetPasswordEmailCode.submitPassword({ password })`
- If complete, `signIn.finalize({ navigate })`.

Handle `needs_second_factor` if the app enables MFA.

9. Add server-side auth helpers.

For Next.js:

```ts
import { auth, currentUser } from '@clerk/nextjs/server'

export async function requireViewer() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  if (!email) {
    throw new Error('MISSING_EMAIL')
  }

  return {
    clerkUserId: userId,
    email,
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || null,
    imageUrl: user?.imageUrl ?? null,
    sessionClaims,
  }
}
```

Every protected API route or server action should call `requireViewer()` or use `auth.protect()`. Return JSON `401` for API callers instead of redirecting from route handlers unless the route is page navigation.

10. Add database user linking.

Use Clerk's user ID as the stable external identity.

Prisma example:

```prisma
model AdminUser {
  id          String   @id @default(cuid())
  clerkUserId String   @unique
  email       String   @unique
  fullName    String?
  imageUrl    String?
  role        AppRole  @default(ADMIN)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AppRole {
  ADMIN
}
```

On-demand upsert helper:

```ts
export async function upsertAdminUser(viewer: {
  clerkUserId: string
  email: string
  fullName?: string | null
  imageUrl?: string | null
}) {
  return prisma.adminUser.upsert({
    where: { clerkUserId: viewer.clerkUserId },
    update: {
      email: viewer.email,
      fullName: viewer.fullName ?? undefined,
      imageUrl: viewer.imageUrl ?? undefined,
    },
    create: {
      clerkUserId: viewer.clerkUserId,
      email: viewer.email,
      fullName: viewer.fullName ?? undefined,
      imageUrl: viewer.imageUrl ?? undefined,
    },
  })
}
```

If the database already has admin users, ask the user how to map existing records to Clerk users before running migrations.

11. Add Clerk webhooks when required.

If immediate sync is required, create a public route like `/api/webhooks/clerk` and verify the signature:

```ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const user = evt.data
      const email = user.email_addresses.find((item) => item.id === user.primary_email_address_id)?.email_address

      if (email) {
        await prisma.adminUser.upsert({
          where: { clerkUserId: user.id },
          update: {
            email,
            fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
            imageUrl: user.image_url ?? null,
          },
          create: {
            clerkUserId: user.id,
            email,
            fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
            imageUrl: user.image_url ?? null,
          },
        })
      }
    }

    if (evt.type === 'user.deleted' && evt.data.id) {
      await prisma.adminUser.deleteMany({ where: { clerkUserId: evt.data.id } })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Clerk webhook verification failed:', error)
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }
}
```

Make the route public in middleware. Keep it protected only by Clerk's webhook signature verification. Ask the user for `CLERK_WEBHOOK_SIGNING_SECRET` before testing.

12. Add role and authorization handling.

Choose one source of truth and document it:

- Clerk public metadata: simple for roles that can be included in session claims.
- Clerk private metadata: safer for server-only role data, but requires backend fetches.
- Database role: good for app-specific admin panels.
- Organization roles: best for B2B/team apps.

Do not assume admin from email domains unless the user explicitly asks. Protect admin routes separately.

13. Add logout.

Use Clerk's `signOut({ redirectUrl: '/' })` from `useAuth()` or a project wrapper hook. Ensure navigation and menus update from `useUser()` / `useAuth()`.

## Error Handling

Map known Clerk codes to safe copy. Examples:

```ts
const CLERK_ERROR_MESSAGES: Record<string, string> = {
  form_password_incorrect: 'We could not sign you in with that email and password.',
  form_identifier_not_found: 'We could not sign you in with that email and password.',
  form_identifier_exists: 'That email is already registered. Please log in or use a different email.',
  verification_expired: 'This verification code has expired. Please request a new one.',
  form_code_incorrect: 'That verification code was not accepted. Please try again.',
  verification_failed: 'That verification code was not accepted. Please try again.',
  session_exists: 'You are already signed in.',
}
```

Do not return raw Clerk error messages if they expose internal state or enable account enumeration. For production, consider strict user enumeration protections and avoid telling users whether an email exists during login.

## Security Checklist

- Clerk keys are in env only.
- Secret key is not prefixed with `NEXT_PUBLIC_`.
- `.env.example` has placeholders only.
- `redirect_url` accepts only safe relative paths.
- Auth pages redirect signed-in users away.
- Protected pages and APIs are protected by middleware and/or server helpers.
- Webhook routes are public in middleware but signature-verified.
- Signup includes Clerk captcha container when bot protection is enabled.
- Password reset does not reveal whether an email exists unless the user accepts that UX.
- UI disables repeated submits while Clerk is fetching.
- API routes validate request bodies with a schema library or equivalent.
- Database user table stores Clerk ID and app-specific fields only, not passwords or OAuth tokens.
- Account deletion behavior is explicit: soft delete, anonymize, or hard delete.
- Production domains and HTTPS are configured before launch.

## Required QA Scenarios

Run these before marking complete:

- New admin email/password signup:
  - Submit signup form.
  - Receive code.
  - Verify email.
  - Session becomes active.
  - Admin lands on `/admin` (or intended admin redirect).
  - Local database admin user exists or is created on first protected backend action.
- Existing admin email/password login:
  - Valid credentials succeed.
  - Invalid credentials show safe error copy.
  - Protected `redirect_url` returns user to original admin page.
- Continue with Google from admin login:
  - Existing Google-linked admin signs in.
  - Callback completes through `/sso-callback`.
- Continue with Google from admin signup:
  - First-time Google admin signs up.
  - Existing email admin attempting Google gets the correct transfer/linking behavior according to Clerk settings.
- OAuth cancellation/error:
  - User returns to auth page with safe error handling.
- Forgot password (admin only):
  - Reset code is sent to admin email.
  - Code verifies.
  - New password is accepted.
  - Session finalizes or admin is routed to `/admin`.
- Signed-in admin visiting `/login` or `/signup` is redirected to `/admin`.
- Signed-out user (or non-admin user) visiting an admin page is redirected to sign in.
- Protected admin API route returns `401` JSON for unauthenticated API requests.
- Clerk webhook:
  - Valid webhook creates/updates/deletes local admin user.
  - Invalid signature returns `400`.
  - Repeated event is idempotent.

## Verification Commands

Use the new project's actual scripts. Typical Next.js checks:

```bash
npm run lint
npm run build
npm test
```

If there are no tests, add focused tests for:

- Safe redirect parsing.
- Clerk error mapping.
- Server auth helper failure behavior.
- Webhook event handling with valid and invalid signatures, if practical.

## Completion Criteria

The work is complete only when:

- Custom UI pages are connected to Clerk flows.
- Backend pages/API routes are protected.
- Database user linking works.
- Google OAuth completes through the SSO callback.
- Required environment variables and dashboard setup are documented.
- The agent asked the user for missing keys/dashboard actions before attempting dependent work.
- Tests/build pass, or any remaining blocker is explicitly documented with the exact user action needed.

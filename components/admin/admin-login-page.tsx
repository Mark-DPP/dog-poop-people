"use client";

import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClerkErrorMessage } from "@/lib/auth/clerk-errors";

const featureBullets = [
  "Review customer requests",
  "Manage weekly customers",
  "Track lead status",
];

type AuthView = "sign-in" | "otp" | "forgot-email" | "forgot-reset";
type OtpMode = "first-factor" | "second-factor";

export function AdminLoginPage({
  initialMessage,
  initialRedirectTarget,
}: {
  initialMessage: string | null;
  initialRedirectTarget: string;
}) {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [redirectTarget] = useState(initialRedirectTarget);
  const [authView, setAuthView] = useState<AuthView>("sign-in");
  const [otpMode, setOtpMode] = useState<OtpMode>("first-factor");
  const [pendingEmail, setPendingEmail] = useState("");

  const completeSignIn = async () => {
    if (!signIn) {
      return;
    }

    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(redirectTarget);

        if (url.startsWith("http")) {
          window.location.href = url;
          return;
        }

        router.push(url);
        router.refresh();
      },
    });
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!signIn) {
      setMessage("Clerk is still loading. Please try again in a moment.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setMessage("Enter your admin email and password.");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        setMessage(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await completeSignIn();
        return;
      }

      if (signIn.status === "needs_second_factor") {
        const { error: otpError } = await signIn.mfa.sendEmailCode();

        if (otpError) {
          setMessage(getClerkErrorMessage(otpError));
          return;
        }

        setPendingEmail(email);
        setOtpMode("second-factor");
        setAuthView("otp");
        setMessage("We sent a verification code to your email.");
        return;
      }

      if (
        signIn.status === "needs_first_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const { error: otpError } =
          signIn.status === "needs_client_trust"
            ? await signIn.mfa.sendEmailCode()
            : await signIn.emailCode.sendCode({ emailAddress: email });

        if (otpError) {
          setMessage(getClerkErrorMessage(otpError));
          return;
        }

        setPendingEmail(email);
        setOtpMode(
          signIn.status === "needs_client_trust"
            ? "second-factor"
            : "first-factor",
        );
        setAuthView("otp");
        setMessage("We sent a verification code to your email.");
        return;
      }

      if (signIn.status === "needs_new_password") {
        setPendingEmail(email);
        setAuthView("forgot-reset");
        setMessage("Enter a new password to finish setting up this account.");
        return;
      }

      setMessage("Clerk needs another step before sign in can continue.");
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOtpVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!signIn) {
      setMessage("Clerk is still loading. Please try again in a moment.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    if (!code) {
      setMessage("Enter the verification code.");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error } =
        otpMode === "second-factor"
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signIn.emailCode.verifyCode({ code });

      if (error) {
        setMessage(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await completeSignIn();
        return;
      }

      setMessage("That code was accepted, but Clerk still needs another step.");
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!signIn) {
      setMessage("Clerk is still loading. Please try again in a moment.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setMessage("Enter your admin email.");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error: createError } = await signIn.create({
        identifier: email,
      });

      if (createError) {
        setMessage(getClerkErrorMessage(createError));
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setMessage(getClerkErrorMessage(sendError));
        return;
      }

      setPendingEmail(email);
      setAuthView("forgot-reset");
      setMessage("We sent a password reset code to your email.");
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!signIn) {
      setMessage("Clerk is still loading. Please try again in a moment.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!code || !password || !confirmPassword) {
      setMessage("Enter the code and your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({ code });

      if (verifyError) {
        setMessage(getClerkErrorMessage(verifyError));
        return;
      }

      const { error: passwordError } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password,
          signOutOfOtherSessions: true,
        });

      if (passwordError) {
        setMessage(getClerkErrorMessage(passwordError));
        return;
      }

      if (signIn.status === "complete") {
        await completeSignIn();
        return;
      }

      setMessage("Password updated. Please sign in with your new password.");
      setAuthView("sign-in");
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const returnToSignIn = () => {
    void signIn?.reset();
    setAuthView("sign-in");
    setMessage(null);
    setPendingEmail("");
  };

  const handleGoogleSignIn = async () => {
    setMessage(null);

    if (!signIn) {
      setMessage("Clerk is still loading. Please try again in a moment.");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: redirectTarget,
      });

      if (error) {
        setMessage(getClerkErrorMessage(error));
        setIsSigningIn(false);
      }
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#F8FAFC] font-sans text-[#12321C]">
      <section className="grid min-h-dvh lg:grid-cols-2">
        <div className="relative isolate hidden min-h-dvh overflow-hidden bg-[#0F5A24] lg:block">
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.045, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/login.png"
              alt="Dog Poop People admin login background"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[#062D13]/45" />
          <motion.div
            className="absolute -left-24 top-20 size-72 rounded-full bg-[#65C22E]/28 blur-3xl"
            animate={{ y: [0, 26, 0], opacity: [0.65, 0.95, 0.65] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 right-8 size-80 rounded-full bg-[#FFF8E6]/16 blur-3xl"
            animate={{ y: [0, -24, 0], x: [0, -12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex min-h-dvh items-center px-12 xl:px-20">
            <motion.div
              className="max-w-xl text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-4 py-2 text-sm font-extrabold text-[#FFF8E6] shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <ShieldCheck className="size-4 text-[#65C22E]" />
                Dog Poop People
              </div>
              <h1 className="mt-7 font-heading text-6xl font-extrabold leading-none tracking-normal xl:text-7xl">
                Admin Portal
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/82">
                Manage customer requests, review qualification forms, update
                lead status, and keep your business organized from one secure
                dashboard.
              </p>
              <div className="mt-10 grid gap-4">
                {featureBullets.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-base font-bold text-[#FFF8E6]">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#65C22E] text-[#073516] shadow-[0_14px_34px_rgba(101,194,46,0.32)]">
                      <CheckCircle2 className="size-5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(101,194,46,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,90,36,0.12),transparent_35%),linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_52%,#F1F8ED_100%)]" />
          <motion.div
            className="absolute right-6 top-8 z-10 hidden max-w-[13rem] rounded-2xl border border-white/80 bg-white/78 px-4 py-3 text-sm font-extrabold text-[#0F5A24] shadow-[0_20px_60px_rgba(15,90,36,0.12)] backdrop-blur-xl xl:flex xl:items-center xl:gap-2"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <Sparkles className="size-4 text-[#65C22E]" />
            Secure admin workspace
          </motion.div>
          <motion.div
            className="relative w-full max-w-[480px] rounded-[1.75rem] border border-white/82 bg-white/88 p-6 shadow-[0_34px_120px_rgba(15,90,36,0.18)] backdrop-blur-2xl sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Dog Poop People"
                width={104}
                height={98}
                priority
                className="h-20 w-auto object-contain drop-shadow-[0_16px_34px_rgba(15,90,36,0.15)]"
              />
            </div>
            <div className="mt-6 text-center">
              <h2 className="font-heading text-4xl font-extrabold tracking-normal text-[#0F5A24]">
                Welcome Back
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#405244]/72">
                This area is restricted to Dog Poop People administrators only.
              </p>
            </div>

            {message ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{message}</span>
              </div>
            ) : null}

            {authView === "sign-in" ? (
              <>
                <form className="mt-8 grid gap-5" onSubmit={handleLogin}>
                  <label className="grid gap-2">
                    <span className="text-sm font-extrabold text-[#12321C]">Email Address</span>
                    <span className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                      <Input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="admin@dogpooppeople.com"
                        className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                      />
                    </span>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-extrabold text-[#12321C]">Password</span>
                    <span className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                      <Input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                      />
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 font-bold text-[#405244]">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[#0F5A24]/20 accent-[#65C22E]"
                      />
                      Remember Me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView("forgot-email");
                        setMessage(null);
                      }}
                      className="font-extrabold text-[#0F5A24] transition hover:text-[#65C22E]"
                    >
                      Forgot Password
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSigningIn || !signIn || fetchStatus === "fetching"}
                    className="mt-2 h-14 rounded-xl text-base shadow-[0_20px_55px_rgba(101,194,46,0.36)]"
                  >
                    {isSigningIn ? "Signing In..." : "Login"}
                    {isSigningIn ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </Button>
                </form>

                <div className="mt-5 grid gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#0F5A24]/10" />
                    <span className="text-xs font-extrabold uppercase text-[#405244]/48">
                      or
                    </span>
                    <span className="h-px flex-1 bg-[#0F5A24]/10" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSigningIn || !signIn || fetchStatus === "fetching"}
                    onClick={handleGoogleSignIn}
                    className="h-14 rounded-xl bg-white text-base shadow-[0_14px_38px_rgba(15,90,36,0.08)]"
                  >
                    <span className="font-heading text-xl font-extrabold leading-none text-[#DB4437]">
                      G
                    </span>
                    Continue with Google
                  </Button>
                </div>
              </>
            ) : null}

            {authView === "otp" ? (
              <form className="mt-8 grid gap-5" onSubmit={handleOtpVerification}>
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-[#12321C]">Verification Code</span>
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                    <Input
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter the email code"
                      className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                    />
                  </span>
                </label>
                <p className="text-sm font-semibold leading-6 text-[#405244]/72">
                  Code sent to {pendingEmail}.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSigningIn || !signIn || fetchStatus === "fetching"}
                  className="h-14 rounded-xl text-base shadow-[0_20px_55px_rgba(101,194,46,0.36)]"
                >
                  {isSigningIn ? "Verifying..." : "Verify Code"}
                  {isSigningIn ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={returnToSignIn}
                  className="h-12 rounded-xl bg-white"
                >
                  Back to Login
                </Button>
              </form>
            ) : null}

            {authView === "forgot-email" ? (
              <form className="mt-8 grid gap-5" onSubmit={handleForgotPassword}>
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-[#12321C]">Admin Email</span>
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@dogpooppeople.com"
                      className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                    />
                  </span>
                </label>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSigningIn || !signIn || fetchStatus === "fetching"}
                  className="h-14 rounded-xl text-base shadow-[0_20px_55px_rgba(101,194,46,0.36)]"
                >
                  {isSigningIn ? "Sending Code..." : "Send Reset Code"}
                  {isSigningIn ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={returnToSignIn}
                  className="h-12 rounded-xl bg-white"
                >
                  Back to Login
                </Button>
              </form>
            ) : null}

            {authView === "forgot-reset" ? (
              <form className="mt-8 grid gap-5" onSubmit={handleResetPassword}>
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-[#12321C]">Reset Code</span>
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                    <Input
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter the reset code"
                      className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                    />
                  </span>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-[#12321C]">New Password</span>
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                    <Input
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter a new password"
                      className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                    />
                  </span>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-[#12321C]">Confirm Password</span>
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/48" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm the new password"
                      className="rounded-xl pl-11 focus:shadow-[0_16px_42px_rgba(101,194,46,0.16)]"
                    />
                  </span>
                </label>
                {pendingEmail ? (
                  <p className="text-sm font-semibold leading-6 text-[#405244]/72">
                    Resetting password for {pendingEmail}.
                  </p>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSigningIn || !signIn || fetchStatus === "fetching"}
                  className="h-14 rounded-xl text-base shadow-[0_20px_55px_rgba(101,194,46,0.36)]"
                >
                  {isSigningIn ? "Updating..." : "Update Password"}
                  {isSigningIn ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={returnToSignIn}
                  className="h-12 rounded-xl bg-white"
                >
                  Back to Login
                </Button>
              </form>
            ) : null}

            <p className="mt-7 rounded-xl border border-[#0F5A24]/8 bg-[#F8FAFC] px-4 py-3 text-center text-xs font-bold text-[#405244]/66">
              This portal is for authorized administrators only.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Home,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";

import { submitLeadForm } from "@/app/actions/forms";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { serviceRequestSchema, type ServiceRequestFormValues } from "@/lib/forms";

function getTimestamp() {
  return new Date().getTime();
}

const steps = [
  {
    title: "Your Details",
    copy: "Tell us who to contact.",
    fields: ["fullName", "email", "phone"] satisfies FieldPath<ServiceRequestFormValues>[],
  },
  {
    title: "Property",
    copy: "Confirm address and service area.",
    fields: ["address", "loudounCounty"] satisfies FieldPath<ServiceRequestFormValues>[],
  },
  {
    title: "Service Fit",
    copy: "Choose the service and yard details.",
    fields: ["serviceType", "dogs", "yardSize"] satisfies FieldPath<ServiceRequestFormValues>[],
  },
  {
    title: "Notes",
    copy: "Add anything helpful before submitting.",
    fields: ["accessNotes", "message"] satisfies FieldPath<ServiceRequestFormValues>[],
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-bold text-[#B42318]">{message}</p>;
}

function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#0F5A24]/56" />
    </div>
  );
}

export function CustomerQualificationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(getTimestamp);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [finalStepEnteredAt, setFinalStepEnteredAt] = useState(0);
  const {
    register,
    handleSubmit,
    trigger,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      serviceType: undefined,
      dogs: undefined,
      yardSize: undefined,
      loudounCounty: false,
      accessNotes: "",
      message: "",
      website: "",
    },
    mode: "onTouched",
  });
  const yardSize = useWatch({ control, name: "yardSize" });

  const nextStep = async () => {
    const isValid = await trigger(steps[activeStep].fields, { shouldFocus: true });

    if (activeStep === 2 && yardSize === "over-quarter") {
      return;
    }

    if (isValid) {
      setActiveStep((step) => {
        const nextStepIndex = Math.min(step + 1, steps.length - 1);

        if (nextStepIndex === steps.length - 1) {
          setFinalStepEnteredAt(getTimestamp());
        }

        return nextStepIndex;
      });
    }
  };

  const onSubmit = async (data: ServiceRequestFormValues) => {
    if (activeStep !== steps.length - 1) {
      return;
    }

    if (getTimestamp() - finalStepEnteredAt < 600) {
      return;
    }

    setSubmitError("");
    setSubmitMessage("");

    const result = await submitLeadForm({
      ...data,
      formStartedAt,
    });

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    const nextFormStartedAt = getTimestamp();
    setSubmitMessage(result.message);
    setSubmitted(true);
    setActiveStep(0);
    setFormStartedAt(nextFormStartedAt);
    reset({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      serviceType: undefined,
      dogs: undefined,
      yardSize: undefined,
      loudounCounty: false,
      accessNotes: "",
      message: "",
      website: "",
    });
  };

  return (
    <main className="min-h-dvh overflow-hidden bg-[#FAF2DE]">
      <SiteHeader />
      <section className="relative isolate overflow-hidden bg-[#151A16] px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <Image
          src="/contact.png"
          alt="Clean backyard ready for Dog Poop People service"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[52%_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,23,15,0.94)_0%,rgba(15,90,36,0.7)_52%,rgba(13,23,15,0.35)_100%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_0.74fr] lg:items-end">
          <motion.div
            className="max-w-3xl text-white"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-4 py-2 text-sm font-extrabold text-[#FFF8E6] shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <ClipboardCheck className="size-4 text-[#65C22E]" />
              Request a Service
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              Start Your Service Request.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              A simple four-step signup request for Loudoun County homes,
              weekly cleanup, one-time service, and dog areas up to 1/4 acre.
            </p>
          </motion.div>

          <motion.div
            className="rounded-[2rem] border border-white/20 bg-white/14 p-6 text-white shadow-[0_26px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid gap-4 text-sm font-semibold leading-6 text-white/78">
              {[
                "Loudoun County, VA only",
                "One-time or weekly service only",
                "Dog areas up to 1/4 acre",
                "+$5 per additional dog after the first",
              ].map((item) => (
                <p key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#65C22E]" />
                  {item}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute left-0 top-16 size-80 rounded-full bg-[#65C22E]/12 blur-3xl" />
        <div className="absolute bottom-32 right-0 size-96 rounded-full bg-[#F5B84B]/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-[2.25rem] border border-[#0F5A24]/10 bg-white/84 p-5 shadow-[0_24px_80px_rgba(31,46,35,0.1)] sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
              Progress
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-[#0F5A24]">
              Request a Service
            </h2>
            <div className="mt-8 grid gap-3">
              {steps.map((step, index) => {
                const isComplete = index < activeStep || submitted;
                const isCurrent = index === activeStep && !submitted;

                return (
                  <div
                    key={step.title}
                    className={`flex gap-4 rounded-[1.5rem] border p-4 transition ${
                      isCurrent
                        ? "border-[#65C22E]/45 bg-[#E8F7DF]"
                        : "border-[#0F5A24]/10 bg-[#F7F9F4]"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-extrabold ${
                        isComplete
                          ? "bg-[#65C22E] text-[#073516]"
                          : isCurrent
                            ? "bg-[#0F5A24] text-white"
                            : "bg-white text-[#0F5A24]"
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="size-5" /> : index + 1}
                    </span>
                    <span>
                      <span className="block font-heading text-base font-extrabold text-[#12321C]">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-[#405244]">
                        {step.copy}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          <motion.div
            className="rounded-[2.25rem] border border-white/70 bg-white/92 p-5 shadow-[0_30px_100px_rgba(31,46,35,0.13)] backdrop-blur-xl sm:p-7 lg:p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
          >
            {submitted ? (
              <motion.div
                className="rounded-[2rem] border border-[#65C22E]/26 bg-[#E8F7DF] p-6 text-[#0F5A24]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42 }}
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#65C22E] text-[#073516]">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="mt-5 font-heading text-2xl font-extrabold">
                  Thank you. Your request has been received.
                </h3>
                <p className="mt-3 leading-7 text-[#405244]">
                  {submitMessage || "We will review your details and contact you soon."}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const nextFormStartedAt = getTimestamp();
                      reset({
                        fullName: "",
                        email: "",
                        phone: "",
                        address: "",
                        serviceType: undefined,
                        dogs: undefined,
                        yardSize: undefined,
                        loudounCounty: false,
                        accessNotes: "",
                        message: "",
                        website: "",
                      });
                      setFormStartedAt(nextFormStartedAt);
                      setSubmitError("");
                      setSubmitMessage("");
                      setActiveStep(0);
                      setSubmitted(false);
                    }}
                  >
                    Submit another request
                  </Button>
                  <Button asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form
                className="grid gap-7"
                onSubmit={handleSubmit(onSubmit)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    event.target instanceof HTMLInputElement
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <label className="sr-only" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    {...register("website")}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
                    {activeStep === 0 ? <UserRound className="size-5" /> : null}
                    {activeStep === 1 ? <Home className="size-5" /> : null}
                    {activeStep === 2 ? <PawPrint className="size-5" /> : null}
                    {activeStep === 3 ? <Sparkles className="size-5" /> : null}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#B68020]">
                      Step {activeStep + 1} of {steps.length}
                    </p>
                    <h3 className="font-heading text-2xl font-extrabold text-[#0F5A24]">
                      {steps[activeStep].title}
                    </h3>
                  </div>
                </div>

                {activeStep === 0 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Full Name</span>
                      <Input {...register("fullName")} autoComplete="name" />
                      <FieldError message={errors.fullName?.message} />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Email Address</span>
                      <Input type="email" {...register("email")} autoComplete="email" />
                      <FieldError message={errors.email?.message} />
                    </label>
                    <label className="grid gap-2 md:col-span-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Phone Number</span>
                      <Input type="tel" {...register("phone")} autoComplete="tel" />
                      <FieldError message={errors.phone?.message} />
                    </label>
                  </div>
                ) : null}

                {activeStep === 1 ? (
                  <div className="grid gap-5">
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Property Address</span>
                      <Input
                        {...register("address")}
                        autoComplete="street-address"
                        placeholder="Street address, city, ZIP code"
                      />
                      <FieldError message={errors.address?.message} />
                    </label>
                    <label className="flex items-start gap-3 rounded-[1.5rem] border border-[#0F5A24]/10 bg-[#F7F9F4] p-4">
                      <input
                        type="checkbox"
                        className="mt-1 size-5 rounded border-[#0F5A24]/24 accent-[#65C22E]"
                        {...register("loudounCounty")}
                      />
                      <span>
                        <span className="block text-sm font-extrabold text-[#12321C]">
                          I confirm this property is located in Loudoun County, VA.
                        </span>
                        <FieldError message={errors.loudounCounty?.message} />
                      </span>
                    </label>
                  </div>
                ) : null}

                {activeStep === 2 ? (
                  <div className="grid gap-5 md:grid-cols-3">
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Service Type</span>
                      <SelectWrap>
                        <Select {...register("serviceType")} defaultValue="">
                          <option value="" disabled>Choose service</option>
                          <option value="one-time">One Time Service $100</option>
                          <option value="weekly">Weekly Service $25 per visit</option>
                        </Select>
                      </SelectWrap>
                      <FieldError message={errors.serviceType?.message} />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Number of Dogs</span>
                      <SelectWrap>
                        <Select {...register("dogs")} defaultValue="">
                          <option value="" disabled>Choose dogs</option>
                          <option value="1">1 dog</option>
                          <option value="2">2 dogs</option>
                          <option value="3">3 dogs</option>
                          <option value="4">4 dogs</option>
                          <option value="5+">5+ dogs</option>
                        </Select>
                      </SelectWrap>
                      <p className="text-xs font-semibold leading-5 text-[#405244]/72">
                        First dog included. Each additional dog is +$5 per visit.
                      </p>
                      <FieldError message={errors.dogs?.message} />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Yard Size</span>
                      <SelectWrap>
                        <Select {...register("yardSize")} defaultValue="">
                          <option value="" disabled>Choose yard size</option>
                          <option value="under-quarter">Under 1/4 acre</option>
                          <option value="exact-quarter">Exactly 1/4 acre</option>
                          <option value="over-quarter">Over 1/4 acre</option>
                        </Select>
                      </SelectWrap>
                      {yardSize === "over-quarter" ? (
                        <p className="flex items-start gap-2 rounded-2xl border border-[#F5B84B]/40 bg-[#FFF0CF] px-4 py-3 text-sm font-bold leading-6 text-[#7A4A00]">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                          At this time, we only service dog areas up to 1/4 acre.
                        </p>
                      ) : null}
                      <FieldError message={errors.yardSize?.message} />
                    </label>
                  </div>
                ) : null}

                {activeStep === 3 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Access Notes</span>
                      <Textarea
                        {...register("accessNotes")}
                        placeholder="Gate code, side entrance, pets outside, or anything we should know."
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-extrabold text-[#12321C]">Message</span>
                      <Textarea
                        {...register("message")}
                        placeholder="Tell us anything else about your yard or service needs."
                      />
                    </label>
                  </div>
                ) : null}

                <div className="flex flex-col justify-between gap-3 border-t border-[#0F5A24]/10 pt-6 sm:flex-row">
                  {submitError ? (
                    <p className="rounded-2xl border border-[#B42318]/20 bg-[#FEF3F2] px-4 py-3 text-sm font-bold leading-6 text-[#B42318] sm:order-2 sm:flex-1">
                      {submitError}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activeStep === 0 || isSubmitting}
                    onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      key="next-step"
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting}
                    >
                      Next Step
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button key="submit-request" type="submit" disabled={isSubmitting}>
                      <ShieldCheck className="size-4" />
                      {isSubmitting ? "Submitting..." : "Submit Service Request"}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

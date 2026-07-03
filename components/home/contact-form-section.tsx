"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MapPinned, MessageSquareText, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { submitContactForm } from "@/app/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactFormValues } from "@/lib/forms";

function getTimestamp() {
  return new Date().getTime();
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-bold text-[#B42318]">{message}</p>;
}

export function ContactFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(getTimestamp);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitError("");
    setSubmitMessage("");

    const result = await submitContactForm({
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
    setFormStartedAt(nextFormStartedAt);
    reset({
      fullName: "",
      email: "",
      phone: "",
      message: "",
      website: "",
    });
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#FAF2DE] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="absolute left-0 top-20 size-80 rounded-full bg-[#65C22E]/12 blur-3xl" />
      <div className="absolute bottom-24 right-0 size-96 rounded-full bg-[#F5B84B]/12 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="rounded-[2.25rem] border border-[#0F5A24]/10 bg-white/84 p-6 shadow-[0_24px_80px_rgba(31,46,35,0.1)] sm:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
            Contact
          </p>
          <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl">
            Have a Question First?
          </h2>
          <p className="mt-5 leading-8 text-[#405244]">
            Send us a quick message and we’ll get back to you.
          </p>

          <div className="mt-8 rounded-[2rem] bg-[#0F5A24] p-6 text-white shadow-[0_24px_70px_rgba(31,46,35,0.16)]">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#65C22E] text-[#073516]">
              <MessageSquareText className="size-6" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-extrabold">Dog Poop People</h3>
            <p className="mt-3 leading-7 text-white/72">
              Serving Loudoun County, Virginia
            </p>
            <p className="mt-2 leading-7 text-white/72">
              Simple pricing. Reliable cleanup. No hidden fees.
            </p>
            <div className="mt-7 grid gap-4 text-sm font-bold text-white/76">
              <p className="flex items-center gap-3">
                <Phone className="size-4 text-[#65C22E]" />
                Phone: Coming Soon
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 text-[#65C22E]" />
                Email: Coming Soon
              </p>
              <p className="flex items-center gap-3">
                <MapPinned className="size-4 text-[#65C22E]" />
                Loudoun County, Virginia
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-[2.25rem] border border-white/70 bg-white/90 p-5 shadow-[0_30px_100px_rgba(31,46,35,0.13)] backdrop-blur-xl sm:p-7 lg:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.08 }}
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
                Thanks for reaching out.
              </h3>
              <p className="mt-3 leading-7 text-[#405244]">
                {submitMessage || "We’ll respond as soon as possible."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => {
                  const nextFormStartedAt = getTimestamp();
                  reset({
                    fullName: "",
                    email: "",
                    phone: "",
                    message: "",
                    website: "",
                  });
                  setFormStartedAt(nextFormStartedAt);
                  setSubmitError("");
                  setSubmitMessage("");
                  setSubmitted(false);
                }}
              >
                Send another message
              </Button>
            </motion.div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="sr-only" aria-hidden="true">
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("website")}
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[#12321C]">Phone Number</span>
                <Input type="tel" {...register("phone")} autoComplete="tel" />
                <FieldError message={errors.phone?.message} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[#12321C]">Message</span>
                <Textarea {...register("message")} />
                <FieldError message={errors.message?.message} />
              </label>
              {submitError ? (
                <p className="rounded-2xl border border-[#B42318]/20 bg-[#FEF3F2] px-4 py-3 text-sm font-bold leading-6 text-[#B42318]">
                  {submitError}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                <Send className="size-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

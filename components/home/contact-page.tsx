"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPinned, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ContactFormSection } from "@/components/home/contact-form-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#FAF2DE]">
      <SiteHeader />
      <section className="relative isolate flex min-h-[82svh] items-center overflow-hidden bg-[#151A16] px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <Image
          src="/contact.png"
          alt="Clean backyard and local Dog Poop People service"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[52%_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,23,15,0.92)_0%,rgba(15,90,36,0.64)_50%,rgba(13,23,15,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,23,15,0.35)_0%,transparent_48%,rgba(13,23,15,0.76)_100%)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-end gap-10 lg:grid-cols-[0.95fr_0.72fr]">
          <motion.div
            className="max-w-3xl text-white"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-4 py-2 text-sm font-extrabold text-[#FFF8E6] shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <MapPinned className="size-4 text-[#65C22E]" />
              Serving 17345 Legacy Terrace, Round Hill, VA 20141
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              Contact Dog Poop People
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Ask a question before booking. We’ll keep the answer simple,
              local, and clear.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#contact">Ask a Question</a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/customer-qualification">Request a Service</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="rounded-[2rem] border border-white/20 bg-white/14 p-6 text-white shadow-[0_26px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#65C22E] text-[#073516]">
              <MessageSquareText className="size-6" />
            </div>
            <h2 className="mt-6 font-heading text-2xl font-extrabold">
              Contact page
            </h2>
            <div className="mt-5 grid gap-4 text-sm font-semibold leading-6 text-white/78">
              {[
                "Questions, notes, and general messages",
                "Phone is optional on the contact form",
                "Messages are sent securely",
                "We’ll reply as soon as possible",
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

      <ContactFormSection />
      <SiteFooter />
    </main>
  );
}

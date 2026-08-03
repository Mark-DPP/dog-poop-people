"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroFieldLines, PriceLeafSvg } from "@/components/home/brand-svg";
import { Button } from "@/components/ui/button";

const pricing = [
  {
    title: "First Visit",
    price: "$90",
    note: "A one-time cleanup for a fresh reset.",
    accent: "#F5B84B",
  },
  {
    title: "Weekly Service",
    price: "$15",
    suffix: "/ Visit",
    note: "Reliable cleanup on repeat.",
    accent: "#65C22E",
  },
  {
    title: "Bi-Weekly Service",
    price: "$25",
    suffix: "/ Visit",
    note: "A flexible every-other-week schedule.",
    accent: "#9ED4FF",
  },
  {
    title: "Monthly Service",
    price: "$50",
    suffix: "/ Visit",
    note: "A monthly refresh for lighter needs.",
    accent: "#F5B84B",
  },
];

const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#151A16] px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:px-8"
    >
      <Image
        src="/hero.png"
        alt="Clean residential backyard maintained by Dog Poop People"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_38%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,22,18,0.92)_0%,rgba(22,34,24,0.76)_44%,rgba(15,90,36,0.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,22,18,0.38)_0%,rgba(18,22,18,0)_46%,rgba(18,22,18,0.82)_100%)]" />
      <HeroFieldLines className="bottom-0 right-0 hidden w-[48vw] max-w-3xl lg:block" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="max-w-3xl pt-8 text-white"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.07, delayChildren: 0.02 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/22 bg-[#FFF8E6]/12 px-4 py-2 text-sm font-semibold text-[#FFF8E6] shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
          >
            <CheckCircle2 className="size-4 text-[#65C22E]" />
            Transparent local yard cleanup
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-5xl xl:text-6xl"
          >
            No Contracts. No Hidden Fees. Just Reliable Yard Cleanup.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-7 text-[#F8F1DF]/84 sm:text-base xl:text-lg"
          >
            Dog Poop People keeps your yard clean with simple pricing, dependable
            visits, and no surprise charges. Choose the service that fits your
            home and enjoy a fresher outdoor space without the hassle.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="default">
              <Link href="/customer-qualification">
                Request a Service
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="default" variant="secondary">
              <a href="#pricing">View Pricing</a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/16 bg-white/10 p-4 text-[#FFF8E6] backdrop-blur-md">
              <ShieldCheck className="size-5 text-[#9ED4FF]" />
              <span className="text-sm font-bold">Insured, dependable visits</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/16 bg-white/10 p-4 text-[#FFF8E6] backdrop-blur-md">
              <Sparkles className="size-5 text-[#F5B84B]" />
              <span className="text-sm font-bold">Clean yards without surprises</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          id="pricing"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:justify-self-end"
          initial={{ y: 34, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          {pricing.map((item, index) => (
            <motion.article
              key={item.title}
              className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-[#FFF8E6]/94 p-4 text-[#0F5A24] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md sm:min-h-40 lg:w-[20rem] xl:w-[21rem]"
              animate={{ y: [0, index % 2 === 0 ? -7 : 7, 0] }}
              transition={{
                duration: 4.4 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="absolute right-0 top-0 h-full w-2"
                style={{ backgroundColor: item.accent }}
              />
              <PriceLeafSvg className="absolute -right-4 -top-4 opacity-15" />
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0F5A24]/62">
                {item.title}
              </p>
              <p className="mt-4 text-sm font-extrabold text-[#0F5A24]/70">
                Starting at
              </p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <p className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {item.price}
                </p>
                {item.suffix ? (
                  <span className="rounded-full bg-[#65C22E]/18 px-3 py-1 text-xs font-extrabold text-[#0F5A24]">
                    {item.suffix}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-[#0F5A24]/70">
                {item.note}
              </p>
            </motion.article>
          ))}
          <p className="px-2 text-center text-xs font-semibold leading-5 text-[#FFF8E6]/78 sm:col-span-2 lg:col-span-1 lg:max-w-[21rem]">
            Yard size and additional dogs may affect the final price.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

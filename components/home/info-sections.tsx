"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  CalendarCheck2,
  Check,
  Clock3,
  HandHeart,
  HeartHandshake,
  MapPinned,
  PawPrint,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MultiDogHomesSvg,
  OneTimeCleanupSvg,
  ResidentialYardSvg,
  WeeklyRoutesSvg,
} from "@/components/home/brand-svg";
import { SiteFooter } from "@/components/home/site-footer";
import { Button } from "@/components/ui/button";

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const SHOW_TESTIMONIALS = false;

const features: Array<{
  title: string;
  copy: string;
  icon: LucideIcon;
}> = [
  {
    title: "No hidden fees",
    copy: "Clear pricing before we arrive, with no surprise add-ons.",
    icon: BadgeDollarSign,
  },
  {
    title: "No contracts",
    copy: "Start with a one-time cleanup or cancel weekly service with ease.",
    icon: BadgeCheck,
  },
  {
    title: "Reliable weekly visits",
    copy: "Dependable routes keep your yard fresh through every season.",
    icon: CalendarCheck2,
  },
  {
    title: "Affordable pricing",
    copy: "Simple local rates designed for real households and repeat service.",
    icon: Clock3,
  },
  {
    title: "Friendly local service",
    copy: "A helpful neighborhood team that treats your property with respect.",
    icon: HeartHandshake,
  },
  {
    title: "Safe and sanitary cleanup",
    copy: "Careful removal, disposal, and clean habits from gate to gate.",
    icon: ShieldCheck,
  },
];

const pricingPlans = [
  {
    title: "First Visit",
    price: "$90",
    note: "A thorough first cleanup for yards that need a fresh start.",
    items: [
      "One-time initial cleanup",
      "Complete yard service",
      "Safe waste removal",
      "Base price before adjustments",
    ],
  },
  {
    title: "Weekly Service",
    price: "$15",
    note: "The lowest base price for consistently clean yards.",
    badge: "Most Popular",
    featured: true,
    suffix: "per visit",
    items: [
      "Scheduled weekly visits",
      "Consistent yard upkeep",
      "Flexible cancellation",
      "Lowest recurring base price",
    ],
  },
  {
    title: "Bi-Weekly Service",
    price: "$25",
    note: "A balanced base price for service every other week.",
    suffix: "per visit",
    items: [
      "Service every two weeks",
      "Consistent yard upkeep",
      "Flexible cancellation",
      "Balanced schedule and value",
    ],
  },
  {
    title: "Monthly Service",
    price: "$50",
    note: "A simple base price for a monthly yard refresh.",
    suffix: "per visit",
    items: [
      "One visit each month",
      "Routine yard refresh",
      "Flexible cancellation",
      "Great for lighter needs",
    ],
  },
];

const steps = [
  {
    icon: HandHeart,
    title: "Request service",
    copy: "Tell us your yard size, dogs, and preferred visit rhythm.",
  },
  {
    icon: CalendarCheck2,
    title: "Pick your schedule",
    copy: "Book a one-time reset or keep things fresh with weekly service.",
  },
  {
    icon: Sparkles,
    title: "Enjoy the yard",
    copy: "We handle the cleanup so your outdoor space is ready when you are.",
  },
];

const faqs = [
  {
    question: "How does weekly service work?",
    answer:
      "After you submit the form, we confirm your property details, place you on a recurring weekly route, and visit on the scheduled service day.",
  },
  {
    question: "Do I need to be home?",
    answer:
      "No. As long as we can access the yard safely, you do not need to be home during service.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "Dog Poop People serves Loudoun County, Virginia, with placeholder coverage details ready to refine as routes are finalized.",
  },
  {
    question: "Do you clean large properties?",
    answer:
      "Yes. Larger yards can be cleaned, and we will confirm any special access notes or timing before your first visit.",
  },
  {
    question: "How much does an extra dog cost?",
    answer:
      "Additional dogs cost $5 per dog after the first, keeping multi-dog pricing clear and predictable.",
  },
  {
    question: "What happens after I submit the form?",
    answer:
      "We review your request, confirm pricing and availability, then follow up with the next steps to get your cleanup scheduled.",
  },
];

const serviceAreas = [
  {
    title: "Residential yards",
    background: "#FFF8E6",
    Illustration: ResidentialYardSvg,
  },
  {
    title: "Weekly routes",
    background: "#E8F7DF",
    Illustration: WeeklyRoutesSvg,
  },
  {
    title: "One-time cleanups",
    background: "#EAF6FF",
    Illustration: OneTimeCleanupSvg,
  },
  {
    title: "Multi-dog homes",
    background: "#FFF0CF",
    Illustration: MultiDogHomesSvg,
  },
];

const testimonialImages = [
  {
    src: "/Testimonial1.png",
    alt: "Melissa Carter testimonial for Dog Poop People",
    className: "lg:-rotate-[2deg]",
  },
  {
    src: "/Testimonial2.png",
    alt: "Robert Hayes testimonial for Dog Poop People",
    className: "lg:z-10",
  },
  {
    src: "/Testimonial3.png",
    alt: "Sarah Mitchell testimonial for Dog Poop People",
    className: "lg:rotate-[2deg]",
  },
];

function TestimonialsSection() {
  return (
    <section className="overflow-hidden bg-[#F7F9F4] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[104rem]">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.38 }}
          variants={reveal}
          transition={{ duration: 0.65 }}
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
              Customer Reviews
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl lg:text-6xl">
              Trusted by homeowners who want their weekends back.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#405244]">
              Realistic placeholder customer stories, presented with the same
              polished image-card style as the reference.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-16 overflow-hidden rounded-[2.5rem] border border-[#0F5A24]/12 bg-[linear-gradient(105deg,rgba(232,247,223,0.72),rgba(255,248,230,0.9)_48%,rgba(234,246,255,0.58))] p-4 shadow-[0_32px_110px_rgba(31,46,35,0.12)] sm:p-6 lg:rounded-[3rem] lg:p-5 xl:p-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.24 }}
          variants={reveal}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          <div className="absolute inset-4 rounded-[2rem] border border-white/70 lg:rounded-[2.4rem]" />
          <div className="relative grid gap-6 lg:grid-cols-3 lg:items-center lg:gap-3 xl:gap-4">
            {testimonialImages.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                className={`group ${testimonial.className}`}
                initial={{ opacity: 0, y: 34, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.64, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.015 }}
              >
                <div className="relative aspect-[1492/1054] overflow-hidden rounded-[1.6rem] bg-white p-2 shadow-[0_26px_70px_rgba(31,46,35,0.18)] transition group-hover:shadow-[0_34px_90px_rgba(31,46,35,0.24)] sm:rounded-[2rem] sm:p-3">
                  <Image
                    src={testimonial.src}
                    alt={testimonial.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="rounded-[1.25rem] object-cover sm:rounded-[1.65rem]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function InfoSections() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#FAF2DE] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#F5B84B,#65C22E,transparent)]" />
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 lg:grid-cols-[1.16fr_0.84fr] xl:gap-18">
          <motion.div
            className="relative order-2 lg:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.32 }}
            variants={reveal}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-[420px] overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/50 shadow-[0_36px_110px_rgba(31,46,35,0.18)] sm:h-[560px] lg:h-[720px]">
              <Image
                src="/contact.png"
                alt="Homeowner enjoying a clean backyard"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-[52%_45%]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,13,0.04)_0%,transparent_42%,rgba(15,90,36,0.72)_100%)]" />
              <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-[#FFF8E6]/86 px-5 py-3 text-sm font-extrabold text-[#0F5A24] shadow-[0_18px_48px_rgba(15,90,36,0.18)] backdrop-blur-md sm:left-7 sm:top-7">
                Loudoun County local service
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-[2rem] border border-white/28 bg-white/18 p-6 text-white shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-7">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#FFF8E6]">
                  Local care
                </p>
                <p className="mt-2 max-w-xl font-heading text-2xl font-extrabold sm:text-4xl">
                  Clean yards, clear pricing, dependable visits.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["No contracts", "Weekly routes", "Safe cleanup"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/24 bg-white/16 px-4 py-2 text-center text-xs font-extrabold text-white"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
                Why Choose Us
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl xl:text-6xl">
                Why Homeowners Choose Dog Poop People
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#405244]">
                Premium service does not need to feel complicated. We keep the
                experience simple, reliable, and polished from the first message
                to the final gate latch.
              </p>
            </motion.div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={feature.title}
                    className="group rounded-[1.85rem] border border-[#0F5A24]/10 bg-white/84 p-5 shadow-[0_18px_54px_rgba(31,46,35,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#65C22E]/30 hover:shadow-[0_26px_74px_rgba(31,46,35,0.14)]"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.45 }}
                    variants={reveal}
                    transition={{ duration: 0.54, delay: index * 0.05 }}
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24] transition group-hover:scale-105 group-hover:bg-[#65C22E] group-hover:text-[#073516]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-heading text-lg font-extrabold text-[#12321C]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#405244]">{feature.copy}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative overflow-hidden bg-[#F7F9F4] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_18%_12%,rgba(101,194,46,0.16),transparent_32%),radial-gradient(circle_at_84%_24%,rgba(245,184,75,0.14),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
            transition={{ duration: 0.65 }}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
              Our Base Pricing
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl">
              Simple base pricing for every service schedule.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#405244]">
              Every amount below is a starting price. Your final price is based
              on the service and property details you select.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 lg:grid-cols-4 lg:items-stretch">
            {pricingPlans.map((plan, index) => (
              <motion.article
                key={plan.title}
                className={`relative flex min-h-[31rem] flex-col rounded-[2rem] border p-6 shadow-[0_24px_76px_rgba(31,46,35,0.1)] transition hover:-translate-y-1 hover:shadow-[0_34px_96px_rgba(31,46,35,0.16)] ${
                  plan.featured
                    ? "border-[#65C22E]/55 bg-[#0F5A24] text-white lg:-mt-5 lg:min-h-[34rem]"
                    : "border-[#0F5A24]/10 bg-white/88 text-[#0F5A24]"
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                variants={reveal}
                transition={{ duration: 0.58, delay: index * 0.08 }}
              >
                {plan.badge ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#F5B84B] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#12321C] shadow-[0_16px_42px_rgba(245,184,75,0.34)]">
                    {plan.badge}
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-heading text-2xl font-extrabold">{plan.title}</h3>
                    <p className={`mt-3 text-sm leading-7 ${plan.featured ? "text-white/74" : "text-[#405244]"}`}>
                      {plan.note}
                    </p>
                  </div>
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${plan.featured ? "bg-white/12 text-[#65C22E]" : "bg-[#E8F7DF] text-[#0F5A24]"}`}>
                    <PawPrint className="size-5" />
                  </div>
                </div>

                <div className="mt-9">
                  <p className={`text-sm font-extrabold ${plan.featured ? "text-white/70" : "text-[#405244]"}`}>
                    Starting at
                  </p>
                  <p className="font-heading text-6xl font-extrabold tracking-tight">
                    {plan.price}
                  </p>
                  {plan.suffix ? (
                    <p className={`mt-2 text-sm font-bold ${plan.featured ? "text-white/70" : "text-[#405244]"}`}>
                      {plan.suffix}
                    </p>
                  ) : null}
                </div>

                <ul className="mt-8 grid gap-4">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${plan.featured ? "bg-[#65C22E] text-[#073516]" : "bg-[#E8F7DF] text-[#0F5A24]"}`}>
                        <Check className="size-4" />
                      </span>
                      <span className={`text-sm font-semibold ${plan.featured ? "text-white/86" : "text-[#233528]/82"}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={plan.featured ? "default" : "outline"}
                  className="mt-auto w-full"
                >
                  <Link href="/customer-qualification">Request a Service</Link>
                </Button>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="mx-auto mt-8 max-w-4xl rounded-[2rem] border border-[#0F5A24]/10 bg-white/88 p-6 text-[#0F5A24] shadow-[0_18px_54px_rgba(31,46,35,0.08)] sm:p-7"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
            transition={{ duration: 0.58 }}
          >
            <p className="font-heading text-xl font-extrabold">
              Final pricing is calculated using:
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                "Selected service frequency",
                "Yard size",
                "Additional dogs ($5 per dog after the first)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#233528]/82">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E8F7DF] text-[#0F5A24]">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-[#FAF2DE] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            className="relative h-[340px] rounded-[2.25rem] bg-[linear-gradient(135deg,rgba(101,194,46,0.28),rgba(245,184,75,0.2),rgba(255,248,230,0.92))] p-[1px] shadow-[0_28px_90px_rgba(38,46,32,0.16)] sm:h-[460px] lg:h-[560px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full overflow-hidden rounded-[calc(2.25rem-1px)]">
              <Image
                src="/howitworks.png"
                alt="Neatly maintained backyard after cleanup"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-[50%_42%]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,230,0.02)_0%,transparent_52%,rgba(15,90,36,0.18)_100%)]" />
            </div>
          </motion.div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
              How It Works
            </p>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl">
              A simpler way to keep the yard guest-ready.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-[#405244]">
              From the first quote to every recurring visit, the process is
              built to be clear, quick, and easy to repeat.
            </p>
            <div className="mt-9 grid gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.article
                    key={step.title}
                    className="flex gap-4 rounded-[1.75rem] border border-[#0F5A24]/10 bg-white/82 p-5 shadow-[0_18px_54px_rgba(38,46,32,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_78px_rgba(38,46,32,0.13)]"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={reveal}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7DF] text-[#0F5A24]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-[#0F5A24]">
                        {step.title}
                      </h3>
                      <p className="mt-1 leading-7 text-[#0F5A24]/70">{step.copy}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {SHOW_TESTIMONIALS && <TestimonialsSection />}

      <section
        id="service-area"
        className="bg-[#FAF2DE] px-4 py-24 text-[#0F5A24] sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.38 }}
            variants={reveal}
            transition={{ duration: 0.65 }}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#4C87A8]">
              Service Area
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
              Local, dependable, and built around nearby homes.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#405244]">
              Built for nearby neighborhoods, repeat routes, and homeowners who
              want a tidy yard without managing another chore.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/78 px-5 py-3 font-extrabold text-[#12321C] shadow-[0_16px_44px_rgba(31,46,35,0.08)]">
              <MapPinned className="size-5 text-[#65C22E]" />
              Loudoun County, Virginia
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {serviceAreas.map(({ title, background, Illustration }, index) => (
              <motion.div
                key={title}
                className="group flex min-h-44 items-center gap-5 rounded-[1.75rem] border border-[#0F5A24]/10 p-5 shadow-[0_18px_54px_rgba(38,46,32,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_78px_rgba(38,46,32,0.13)]"
                style={{ backgroundColor: background }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={reveal}
                transition={{ duration: 0.52, delay: index * 0.06 }}
              >
                <span className="block size-24 shrink-0 overflow-hidden rounded-[1.35rem] shadow-[inset_0_0_0_1px_rgba(15,90,36,0.08)] transition group-hover:scale-105">
                  <Illustration />
                </span>
                <p className="font-heading text-xl font-extrabold leading-tight">{title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F7F9F4] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
            transition={{ duration: 0.65 }}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#B68020]">
              FAQ
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#0F5A24] sm:text-5xl">
              Answers before we step into the yard.
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-[#405244]">
              Straightforward service deserves straightforward answers. These
              placeholders can be refined once operations details are final.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            <Accordion defaultValue="faq-0">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#151A16] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Image
          src="/CTA.png"
          alt="Clean green backyard ready for family time"
          fill
          sizes="100vw"
          className="object-cover object-[50%_42%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,20,14,0.9)_0%,rgba(15,90,36,0.68)_52%,rgba(12,20,14,0.35)_100%)]" />

        <motion.div
          className="relative mx-auto max-w-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-3xl text-white">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#F5B84B]">
              Ready when you are
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
              Ready For A Cleaner Yard?
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Get started today with transparent pricing, dependable service,
              and no hidden fees.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/customer-qualification">
                  Request a Service
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </>
  );
}

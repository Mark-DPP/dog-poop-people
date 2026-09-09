"use client";

import { Mail, MapPinned, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/#home" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Service Area", href: "/#service-area" },
  { label: "Request a Service", href: "/customer-qualification" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0B2012] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_0.8fr_1fr]">
        <div>
          <Image
            src="/footerLogo.png"
            alt="Dog Poop People"
            width={220}
            height={147}
            className="h-auto w-40 max-w-full object-contain drop-shadow-[0_18px_42px_rgba(101,194,46,0.18)] sm:w-48"
          />
          <p className="mt-6 max-w-sm leading-7 text-white/68">
            Dog Poop People provides dependable local dog waste cleanup with
            transparent pricing, friendly service, and no hidden fees.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-lg font-extrabold">Navigation</h3>
          <nav className="mt-5 grid gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-white/66 transition hover:text-[#65C22E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="font-heading text-lg font-extrabold">Contact Information</h3>
          <div className="mt-5 grid gap-4 text-sm font-semibold text-white/70">
            <p className="flex items-center gap-3">
              <Phone className="size-4 text-[#65C22E]" />
              <a
                href="tel:+14045309361"
                className="transition hover:text-[#65C22E]"
              >
                Phone: (404) 530-9361
              </a>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-[#65C22E]" />
              <a
                href="mailto:Mark_Moger@dogpooppeople.com"
                className="transition hover:text-[#65C22E]"
              >
                Email: Mark_Moger@dogpooppeople.com
              </a>
            </p>
            <p className="flex items-center gap-3">
              <MapPinned className="size-4 text-[#65C22E]" />
              Loudoun County, Virginia
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm font-semibold text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <p>Dog Poop People © 2026</p>
        <p>Transparent pricing. Dependable service. Cleaner yards.</p>
      </div>
    </footer>
  );
}

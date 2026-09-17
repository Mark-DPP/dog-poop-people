"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

import { HeroSection } from "@/components/home/hero-section";
import { InfoSections } from "@/components/home/info-sections";
import { SiteHeader } from "@/components/home/site-header";
import { SiteLoader } from "@/components/home/site-loader";
import type { ServiceFrequencyConfig } from "@/lib/settings/pricing";

export function HomePage({
  serviceFrequencies,
}: {
  serviceFrequencies: ServiceFrequencyConfig[];
}) {
  const [isLandingReady, setIsLandingReady] = useState(false);
  const handleLoaderComplete = useCallback(() => setIsLandingReady(true), []);

  return (
    <main className="min-h-dvh overflow-hidden bg-[#FAF2DE]">
      <SiteLoader onComplete={handleLoaderComplete} />
      <AnimatePresence>
        {isLandingReady ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <SiteHeader />
            <HeroSection serviceFrequencies={serviceFrequencies} />
            <InfoSections serviceFrequencies={serviceFrequencies} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

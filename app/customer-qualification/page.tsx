import type { Metadata } from "next";

import { CustomerQualificationPage } from "@/components/home/customer-qualification-page";
import { getBusinessSettings } from "@/lib/settings/business-settings";

export const metadata: Metadata = {
  title: "Request a Service | Dog Poop People",
  description:
    "Submit a service request for Dog Poop People at 17345 Legacy Terrace, Round Hill, VA 20141.",
};

export default async function Page() {
  const settings = await getBusinessSettings();

  return <CustomerQualificationPage settings={settings} />;
}

import type { Metadata } from "next";

import { ContactPage } from "@/components/home/contact-page";

export const metadata: Metadata = {
  title: "Contact Dog Poop People | Loudoun County Yard Cleanup",
  description:
    "Contact Dog Poop People or submit a service request for dog waste cleanup at 17345 Legacy Terrace, Round Hill, VA 20141.",
};

export default function Page() {
  return <ContactPage />;
}

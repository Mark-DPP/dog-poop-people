import { HomePage } from "@/components/home/home-page";
import { getBusinessSettings } from "@/lib/settings/business-settings";

export default async function Page() {
  const settings = await getBusinessSettings();

  return <HomePage serviceFrequencies={settings.serviceFrequencies} />;
}

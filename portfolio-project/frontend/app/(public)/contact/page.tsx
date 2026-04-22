import ContactClient from "@/routes/ContactClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("contact", defaultLocale, "/contact");

export default function ContactPage() {
  return <ContactClient />;
}

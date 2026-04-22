import NotFound from "@/routes/NotFound";
import { defaultLocale } from "@/content/site";

export default function NotFoundPage() {
  return <NotFound locale={defaultLocale} />;
}

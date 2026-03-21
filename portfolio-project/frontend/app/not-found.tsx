import NotFound from "@/routes/NotFound";
import { getRequestLocale } from "@/lib/locale";

export default async function NotFoundPage() {
  const locale = await getRequestLocale();

  return <NotFound locale={locale} />;
}

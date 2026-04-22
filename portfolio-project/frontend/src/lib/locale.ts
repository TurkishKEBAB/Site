import { cookies } from "next/headers";

import { defaultLocale, localeCookieName, Locale } from "@/content/site";

export const resolveLocale = (value?: string | null): Locale =>
  value === "tr" ? "tr" : defaultLocale;

export const getRequestLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();

  return resolveLocale(
    cookieStore.get(localeCookieName)?.value ?? cookieStore.get("lang")?.value,
  );
};

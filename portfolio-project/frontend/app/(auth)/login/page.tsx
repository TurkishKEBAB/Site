import type { Metadata } from "next";

import Login from "@/routes/Login";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("login", locale, "/login");
}

export default function LoginPage() {
  return <Login />;
}

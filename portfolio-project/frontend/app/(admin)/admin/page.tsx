import type { Metadata } from "next";

import ProtectedRoute from "@/components/ProtectedRoute";
import Admin from "@/routes/Admin";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("admin", locale, "/admin");
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  );
}

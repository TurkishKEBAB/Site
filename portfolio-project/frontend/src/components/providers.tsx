"use client";

import { ReactNode } from "react";

import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { Locale } from "@/content/site";

interface ProvidersProps {
  children: ReactNode;
  initialLanguage: Locale;
}

export function Providers({ children, initialLanguage }: ProvidersProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

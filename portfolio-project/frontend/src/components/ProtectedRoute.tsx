"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast("error", "You need to sign in to access this page.");

      const timer = setTimeout(() => {
        router.replace("/login");
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (!isLoading && isAuthenticated && user && !user.is_active) {
      showToast("warning", "Your account is not active yet.");
    }

    return undefined;
  }, [isAuthenticated, isLoading, router, showToast, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-cyan-950">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

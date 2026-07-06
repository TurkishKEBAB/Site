import { useQueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/services/api";

import { Providers } from "./providers";

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  apiEndpoints: {
    auth: {
      loginJson: "/auth/login/json",
      me: "/auth/me",
    },
  },
}));

function ProvidersProbe() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="stale-time">
        {String(queryClient.getDefaultOptions().queries?.staleTime)}
      </span>
      <span data-testid="auth-state">
        {String(isLoading)}:{String(isAuthenticated)}
      </span>
    </div>
  );
}

describe("Providers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("wraps children with language, query, toast, and auth providers", async () => {
    render(
      <Providers initialLanguage="en">
        <ProvidersProbe />
      </Providers>,
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByTestId("stale-time")).toHaveTextContent("60000");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("false:false");
    });
    expect(api.get).not.toHaveBeenCalled();
  });
});

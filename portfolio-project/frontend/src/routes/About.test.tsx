import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import type { Skill } from "@/services/types";
import About from "./About";
import { useSkillsQuery } from "@/hooks/usePublicData";

vi.mock("@/hooks/usePublicData", () => ({
  useSkillsQuery: vi.fn(),
}));

vi.mock("@/components/AnimatedSection", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/nexus/CareerViews", () => ({
  CareerViews: () => <div data-testid="career-views">career-views</div>,
}));

const apiSkill = (name = "Admin-created skill"): Skill => ({
  id: "skill-1",
  name,
  category: "Tools",
  domain: "cloud",
  ring: "trial",
  display_order: 1,
});

const queryState = (overrides: Record<string, unknown> = {}) => ({
  data: [apiSkill()],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

describe("About live skills", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })),
    });
    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders API skills in both capability and radar views", () => {
    vi.mocked(useSkillsQuery).mockReturnValue(queryState() as never);

    render(<About locale="en" />);

    expect(screen.getAllByText("Admin-created skill").length).toBeGreaterThanOrEqual(2);
  });

  it("renders the GitLens-first About surface in both locales without AdaLab", () => {
    vi.mocked(useSkillsQuery).mockReturnValue(queryState() as never);

    const { rerender } = render(<About locale="en" />);

    expect(screen.getByRole("heading", { name: /professional summary/i })).toBeInTheDocument();
    expect(screen.getByTestId("career-views")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^education$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /current signal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /what's behind the numbers/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /delivery with scale/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/adalab/i)).not.toBeInTheDocument();

    rerender(<About locale="tr" />);

    expect(screen.getByTestId("career-views")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^eğitim$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/adalab/i)).not.toBeInTheDocument();
  });

  it("renders loading, error/retry, and empty states", () => {
    const refetch = vi.fn();
    vi.mocked(useSkillsQuery).mockReturnValue(
      queryState({ data: undefined, isLoading: true, refetch }) as never,
    );
    const { rerender } = render(<About locale="en" />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    vi.mocked(useSkillsQuery).mockReturnValue(
      queryState({ data: undefined, isLoading: false, isError: true, refetch }) as never,
    );
    rerender(<About locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);

    vi.mocked(useSkillsQuery).mockReturnValue(
      queryState({ data: [], isLoading: false, isError: false, refetch }) as never,
    );
    rerender(<About locale="en" />);
    expect(screen.getByText(/no skills found/i)).toBeInTheDocument();
  });
});

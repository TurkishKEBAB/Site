import { act, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HeroIntro from "./HeroIntro";

describe("HeroIntro", () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false }),
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("renders the intro overlay in the initial server markup", () => {
    const html = renderToStaticMarkup(<HeroIntro />);

    expect(html).toContain('aria-label="Skip intro"');
  });

  it("locks page scroll during the first-visit animation and restores it afterward", () => {
    render(<HeroIntro />);

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Skip intro" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("renders the cinematic full-screen overlay and restores the prior scroll style", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(<HeroIntro />);
    const intro = screen.getByRole("button", { name: "Skip intro" });

    expect(intro).toHaveClass("fixed", "inset-0", "w-full", "place-items-center");
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });

  it("preserves the scrollbar width while the page is locked", () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: window.innerWidth - 16,
    });

    render(<HeroIntro />);

    expect(document.body.style.paddingRight).toBe("16px");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.body.style.paddingRight).toBe("");
  });
});

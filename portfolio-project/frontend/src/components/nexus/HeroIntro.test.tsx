import { act, fireEvent, render, screen } from "@testing-library/react";
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

  it("skips the overlay after the intro has completed in this session", () => {
    sessionStorage.setItem("nx-intro-done", "1");

    render(<HeroIntro />);

    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("allows the visitor to skip the intro immediately", () => {
    render(<HeroIntro />);

    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));

    expect(sessionStorage.getItem("nx-intro-done")).toBe("1");

    act(() => {
      vi.advanceTimersByTime(140);
    });

    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
  });

  it("keeps each role visible long enough to read", () => {
    render(<HeroIntro />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const role = screen.getByRole("button").querySelector<HTMLElement>("span.font-display");

    expect(role).toHaveTextContent("ENTERPRISE BACKEND");
    expect(role).toHaveClass("opacity-100");
  });

  it("locks page scroll during the first-visit animation and restores it afterward", () => {
    render(<HeroIntro />);

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Skip intro" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
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
      vi.advanceTimersByTime(4000);
    });

    expect(document.body.style.paddingRight).toBe("");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AnimatedSection from "./AnimatedSection";

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

describe("AnimatedSection", () => {
  it("keeps content visible by default before hydration", () => {
    render(
      <AnimatedSection>
        <span>visible content</span>
      </AnimatedSection>,
    );

    expect(screen.getByText("visible content").parentElement).not.toHaveStyle({
      opacity: "0",
    });
  });

  it("preserves the reveal animation when explicitly enabled", () => {
    render(
      <AnimatedSection animateOnEnter>
        <span>animated content</span>
      </AnimatedSection>,
    );

    expect(screen.getByText("animated content").parentElement).toHaveStyle({
      opacity: "0",
    });
  });
});

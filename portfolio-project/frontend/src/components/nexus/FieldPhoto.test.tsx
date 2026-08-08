import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import FieldPhoto from "./FieldPhoto";

describe("FieldPhoto", () => {
  afterEach(() => cleanup());

  it("serves responsive webp sources so the full-resolution frame is never shipped", () => {
    render(<FieldPhoto locale="en" />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("srcset", expect.stringContaining("/photo-zurich-768.webp 768w"));
    expect(image).toHaveAttribute("srcset", expect.stringContaining("/photo-zurich-1448.webp 1448w"));
    expect(image).toHaveAttribute("loading", "lazy");
    // Intrinsic dimensions keep the band from shifting layout while it loads.
    expect(image).toHaveAttribute("width", "1448");
    expect(image).toHaveAttribute("height", "1086");
  });

  it("toggles between the graded and original colour treatment", () => {
    render(<FieldPhoto locale="en" />);

    const toggle = screen.getByRole("button", { name: "original" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);

    const restored = screen.getByRole("button", { name: "graded" });
    expect(restored).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img")).toHaveStyle({ filter: "none" });
  });

  it("captions the band in Turkish for the Turkish locale", () => {
    render(<FieldPhoto locale="tr" />);

    expect(screen.getByText("Saha kaydı")).toBeInTheDocument();
    expect(screen.getByText("Zürih · CH")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(expect.stringContaining("Zürih"));
  });
});

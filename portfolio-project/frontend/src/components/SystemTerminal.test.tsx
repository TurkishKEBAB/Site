import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SystemTerminal from "./SystemTerminal";

describe("SystemTerminal", () => {
  it("uses the optimized profile asset by default", () => {
    render(<SystemTerminal />);

    expect(screen.getByRole("img", { name: "Yiğit Okur" })).toHaveAttribute(
      "src",
      "/profile.webp",
    );
    expect(screen.getByRole("img", { name: "Yiğit Okur" })).toHaveAttribute(
      "fetchpriority",
      "high",
    );
  });
});

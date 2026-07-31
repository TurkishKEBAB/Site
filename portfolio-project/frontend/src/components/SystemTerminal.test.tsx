import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SystemTerminal from "./SystemTerminal";

describe("SystemTerminal", () => {
  it("uses a stable uptime value for the initial server-safe render", () => {
    const html = renderToStaticMarkup(<SystemTerminal />);

    expect(html).toContain("0d 00:00:00");
  });

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

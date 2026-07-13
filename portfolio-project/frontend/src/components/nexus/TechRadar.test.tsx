import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TechRadar from "./TechRadar";

describe("TechRadar", () => {
  it("renders supplied blips with their API ring and quadrant", () => {
    render(
      <TechRadar
        locale="en"
        blips={[{ name: "Admin-created skill", ring: "trial", quadrant: 1 }]}
      />,
    );

    const label = screen.getByText("Admin-created skill");
    expect(label.closest("g")).toHaveClass("blip-r1");
    expect(screen.queryByText("Java")).not.toBeInTheDocument();
  });
});

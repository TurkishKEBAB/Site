import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CareerViews } from "./CareerViews";

describe("CareerViews", () => {
  it("switches from the graph to a complete GitLens log", () => {
    render(<CareerViews locale="en" graphLabel="graph" logLabel="log" />);

    expect(screen.getByRole("button", { name: "graph" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "log" }));

    expect(screen.getByText(/git log --graph --oneline --all/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /FRC Houston World Championship/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /HEAD — building the next hard system/i })).toBeInTheDocument();
  });

  it("renders the same history in Turkish", () => {
    render(<CareerViews locale="tr" graphLabel="grafik" logLabel="kayıt" />);
    fireEvent.click(screen.getByRole("button", { name: "kayıt" }));

    expect(screen.getByRole("heading", { name: /Lise temeli/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Işık Üniversitesi Yazılım Mühendisliği/i })).toBeInTheDocument();
  });
});

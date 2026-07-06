import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjectExplorer, { type LocalizedProjectView } from "./ProjectExplorer";

const projects: LocalizedProjectView[] = [
  {
    slug: "portfolio-platform",
    title: "Portfolio Platform",
    summary: "Full-stack portfolio system",
    description: "A full-stack portfolio with admin workflows.",
    impact: "Quality gate passed with staged deployments.",
    technologies: ["Next.js", "FastAPI", "PostgreSQL"],
    featured: true,
    githubUrl: "https://github.com/TurkishKEBAB/Site",
  },
];

describe("ProjectExplorer", () => {
  it("numbers human-facing rows from 01 and opens details", () => {
    render(<ProjectExplorer locale="tr" projects={projects} />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.queryByText("00")).not.toBeInTheDocument();
    expect(screen.getByText("Öne çıkan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /portfolio platform/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Teknoloji seti")).toBeInTheDocument();
  });
});

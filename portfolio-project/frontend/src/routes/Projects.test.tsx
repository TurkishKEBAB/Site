import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Projects from "./Projects";

const { useProjectsQuery, useProjectDossierQuery } = vi.hoisted(() => ({
  useProjectsQuery: vi.fn(),
  useProjectDossierQuery: vi.fn(),
}));

vi.mock("@/hooks/usePublicData", () => ({
  useProjectsQuery,
  useProjectDossierQuery,
}));

vi.mock("@/components/nexus/NxSectionHead", () => ({
  default: () => <div />,
}));

vi.mock("@/components/nexus/ScrambleHeading", () => ({
  default: ({ text }: { text: string }) => <h1>{text}</h1>,
}));

vi.mock("@/components/nexus/ProjectIndex", () => ({
  ProjectIndex: ({ projects, onSelect }: { projects: Array<{ title: string }>; onSelect: (project: unknown) => void }) => (
    <button type="button" onClick={() => onSelect(projects[0])}>{projects[0]?.title}</button>
  ),
}));

vi.mock("@/components/nexus/ProjectDossierModal", () => ({
  ProjectDossierModal: ({ project, dossierLoading }: { project: { impact: string } | null; dossierLoading?: boolean }) => (
    project ? <div data-testid="dossier-modal">{dossierLoading ? "loading" : project.impact}</div> : null
  ),
}));

const project = {
  id: "project-1",
  slug: "demo-project",
  title: "Managed project",
  description: "Description",
  short_description: "Summary",
  technologies: [],
  featured: false,
  display_order: 0,
  created_at: "2026-07-13",
  updated_at: "2026-07-13",
};

describe("Projects", () => {
  it("renders server-provided projects without the loading placeholder", () => {
    const initialProjects = { items: [project], total: 1, page: 1, size: 100, pages: 1 };
    useProjectsQuery.mockImplementation((_params, serverData) => ({
      data: serverData,
      isLoading: !serverData,
      isError: false,
      refetch: vi.fn(),
    }));
    useProjectDossierQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<Projects locale="en" initialProjects={initialProjects} initialProjectsLanguage="en" />);

    expect(screen.getByRole("button", { name: "Managed project" })).toBeInTheDocument();
    expect(screen.queryByText("Loading project index...")).not.toBeInTheDocument();
    expect(useProjectsQuery).toHaveBeenCalledWith(
      { limit: 100, language: "en" },
      initialProjects,
    );
  });

  it("loads the selected project's API dossier into the modal", () => {
    useProjectsQuery.mockReturnValue({
      data: { items: [project], total: 1, page: 1, size: 100, pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useProjectDossierQuery.mockReturnValue({
      data: {
        project_slug: "demo-project",
        impact: "API impact",
        metrics: [],
        c4: [],
        adrs: [],
        log: [],
        diagrams: [],
        gallery: [],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<Projects locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Managed project" }));

    expect(screen.getByTestId("dossier-modal")).toHaveTextContent("API impact");
    expect(useProjectDossierQuery).toHaveBeenCalledWith("demo-project", "en");
  });
});

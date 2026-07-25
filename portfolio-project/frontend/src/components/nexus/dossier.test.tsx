import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { careerGraph } from "@/content/careerGraph";
import type { ProjectDetail } from "@/lib/dossier";

import { CareerMap } from "./CareerMap";
import { DiagramGallery } from "./DiagramGallery";
import { ProjectDossierModal, type DossierLabels } from "./ProjectDossierModal";
import { ProjectIndex } from "./ProjectIndex";
import type { DossierProject } from "@/lib/dossier";

afterEach(() => cleanup());

const labels: DossierLabels = {
  featured: "Featured", project: "Project", dossier: "dossier",
  overview: "overview", architecture: "architecture", decisions: "decisions", engLog: "eng·log", gallery: "gallery",
  impact: "Impact", techStack: "Technology stack", close: "Close project details",
  context: "context", decision: "decision", tradeoff: "trade-off", galleryHint: "add",
};

const dossierDetails: ProjectDetail = {
  metrics: [{ value: "86.97%", label: "coverage" }],
  c4: [{ label: "Context", tiers: [[{ kind: "person", title: "Student" }]] }],
  adrs: [{
    id: "ADR-001",
    title: "One scheduling core, two clients",
    status: "Accepted",
    context: "Shared domain avoids divergent scheduling behavior.",
    decision: "Keep the solver core independent from both clients.",
  }],
  log: [],
  diagrams: [
    {
      id: "c4",
      kind: "c4",
      title: "C4 Model",
      data: [{ label: "Context", tiers: [[{ kind: "person", title: "Student" }]] }],
    },
    {
      id: "schema",
      kind: "schema",
      title: "Class — solver core",
      data: {
        tiers: [[{ name: "Timetable", kind: "class", rows: ["+ solve(sections): Timetable"] }]],
      },
    },
  ],
  gallery: [],
};

const isik: DossierProject = {
  slug: "isikschedule-platform",
  title: "IsikSchedule Platform",
  summary: "Constraint-aware scheduling platform.",
  description: "Shared scheduling domain powering desktop and web.",
  impact: "~1,000 active users; 86.97% coverage.",
  technologies: ["FastAPI", "Next.js", "PostgreSQL"],
  featured: true,
  details: dossierDetails,
};

describe("ProjectIndex", () => {
  it("renders numbered rows and fires onSelect with the project", () => {
    const onSelect = vi.fn();
    const projects: DossierProject[] = [isik, { ...isik, slug: "second", title: "Second System", featured: false }];
    render(<ProjectIndex projects={projects} onSelect={onSelect} featuredLabel="Featured" />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    const firstRow = screen.getByRole("button", { name: /IsikSchedule Platform/ });
    expect(firstRow).toHaveStyle({ position: "relative" });
    fireEvent.click(firstRow);
    expect(onSelect).toHaveBeenCalledWith(isik);
  });
});

describe("ProjectDossierModal", () => {
  it("returns null without a project", () => {
    const { container } = render(<ProjectDossierModal project={null} onClose={vi.fn()} labels={labels} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders dossier tabs and switches to the decisions (ADR) tab", () => {
    render(<ProjectDossierModal project={isik} onClose={vi.fn()} labels={labels} />);
    // overview is default
    expect(screen.getByText("Technology stack")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "decisions" }));
    expect(screen.getByText("ADR-001")).toBeInTheDocument();
    expect(screen.getByText("One scheduling core, two clients")).toBeInTheDocument();
  });

  it("closes on Escape and on the close button", () => {
    const onClose = vi.fn();
    render(<ProjectDossierModal project={isik} onClose={onClose} labels={labels} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    // the close button lives inside the dialog (the backdrop button shares the label)
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close project details" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("restores the previous body overflow value when it closes", () => {
    document.body.style.overflow = "clip";
    const { rerender } = render(
      <ProjectDossierModal project={isik} onClose={vi.fn()} labels={labels} />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<ProjectDossierModal project={null} onClose={vi.fn()} labels={labels} />);

    expect(document.body.style.overflow).toBe("clip");
  });

  it("lazy loads gallery images", () => {
    const projectWithGallery: DossierProject = {
      ...isik,
      details: {
        ...dossierDetails,
        gallery: [{ id: "shot-1", src: "/shot.png", caption: "Shot" }],
      },
    };

    render(
      <ProjectDossierModal
        project={projectWithGallery}
        onClose={vi.fn()}
        labels={labels}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "gallery" }));

    expect(screen.getByRole("img", { name: "Shot" })).toHaveAttribute("loading", "lazy");
    expect(screen.getByRole("img", { name: "Shot" })).toHaveAttribute("decoding", "async");
  });

  it("shows a retry action when the dossier request fails", () => {
    const retry = vi.fn();
    render(
      <ProjectDossierModal
        project={{ ...isik, details: undefined }}
        dossierError
        onRetryDossier={retry}
        onClose={vi.fn()}
        labels={labels}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry dossier/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("DiagramGallery", () => {
  it("switches renderer when a chip is picked", () => {
    render(<DiagramGallery diagrams={dossierDetails.diagrams} />);
    // first diagram is the C4 model
    expect(screen.getByRole("tab", { name: /C4 Model/ })).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByRole("tab", { name: /Class — solver core/ }));
    expect(screen.getByText("+ solve(sections): Timetable")).toBeInTheDocument();
  });
});

describe("CareerMap", () => {
  it("shows the first node's story and advances with the stepper", () => {
    render(<CareerMap lanes={careerGraph.lanes} nodes={careerGraph.nodes} links={careerGraph.links} />);
    expect(screen.getByText(/init — Software Engineering/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next entry" }));
    expect(screen.getByRole("heading", { name: "Core curriculum lands" })).toBeInTheDocument();
  });
});

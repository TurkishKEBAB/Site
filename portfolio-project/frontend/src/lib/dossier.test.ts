import { describe, expect, it } from "vitest";

import type { ProjectDossier } from "@/services/types";
import type { Project } from "@/services/types";

import { toDossierProject } from "./dossier";

const project: Project = {
  id: "project-1",
  title: "Demo project",
  slug: "demo-project",
  description: "Description",
  short_description: "Summary",
  technologies: [],
  featured: true,
  display_order: 0,
  created_at: "2026-07-13",
  updated_at: "2026-07-13",
};

const dossier: ProjectDossier = {
  id: "dossier-1",
  project_id: "project-1",
  project_slug: "demo-project",
  impact: "Guvenilir akis",
  metrics: [
    {
      id: "metric-1",
      value: "86.97%",
      numeric_value: "86.97",
      label: "coverage",
      note: null,
      display_order: 0,
    },
  ],
  c4: [
    {
      id: "level-1",
      label: "Context",
      note: null,
      display_order: 0,
      tiers: [
        [
          {
            id: "node-1",
            kind: "person",
            title: "Student",
            sub: null,
            leaf: false,
            tier_order: 0,
            display_order: 0,
          },
        ],
      ],
    },
  ],
  adrs: [],
  log: [],
  diagrams: [],
  gallery: [
    {
      id: "gallery-1",
      src: "/projects/demo.png",
      caption: "fig 01",
      hint: null,
      display_order: 0,
    },
  ],
};

describe("toDossierProject", () => {
  it("maps an API dossier into ordered renderer data", () => {
    const result = toDossierProject(project, dossier, "tr");

    expect(result.impact).toBe("Guvenilir akis");
    expect(result.details?.metrics[0].label).toBe("coverage");
    expect(result.details?.c4[0].tiers[0][0].kind).toBe("person");
    expect(result.details?.gallery[0].src).toBe("/projects/demo.png");
  });

  it("returns a compact project when the dossier is absent", () => {
    expect(toDossierProject(project, null, "en").details).toBeUndefined();
  });
});

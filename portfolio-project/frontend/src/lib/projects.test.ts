import { describe, expect, it } from "vitest";

import { projectDetails } from "@/content/projectDetails";
import { projectRecords } from "@/content/site";
import type { Project } from "@/services/types";
import { mapProjectsToDossierProjects } from "./projects";

describe("mapProjectsToDossierProjects", () => {
  it("uses API project fields while preserving static dossier data", () => {
    const curatedProject = projectRecords[0];
    const apiProject: Project = {
      id: "project-api-1",
      slug: curatedProject.slug,
      title: "Managed project title",
      short_description: "Managed project summary",
      description: "Managed project description",
      technologies: [
        { id: "technology-1", name: "FastAPI", slug: "fastapi" },
        { id: "technology-2", name: "PostgreSQL", slug: "postgresql" },
      ],
      featured: true,
      display_order: 7,
      created_at: "2026-07-13T12:00:00Z",
      updated_at: "2026-07-13T12:00:00Z",
    };

    const [mapped] = mapProjectsToDossierProjects([apiProject], "en");

    expect(mapped).toMatchObject({
      slug: curatedProject.slug,
      title: "Managed project title",
      summary: "Managed project summary",
      description: "Managed project description",
      technologies: ["FastAPI", "PostgreSQL"],
      featured: true,
      details: projectDetails[curatedProject.slug],
    });
    expect(mapped.impact).toBe(curatedProject.impact.en);
  });

  it("falls back to the description when the API has no short description", () => {
    const apiProject: Project = {
      id: "project-api-2",
      slug: "admin-created-project",
      title: "Admin-created project",
      short_description: "",
      description: "The full description is the available summary.",
      technologies: [],
      featured: false,
      display_order: 0,
      created_at: "2026-07-13T12:00:00Z",
      updated_at: "2026-07-13T12:00:00Z",
    };

    const [mapped] = mapProjectsToDossierProjects([apiProject], "en");

    expect(mapped.summary).toBe(apiProject.description);
    expect(mapped.impact).toBe("");
    expect(mapped.details).toBeUndefined();
  });
});

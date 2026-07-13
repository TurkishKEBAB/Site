import { describe, expect, it } from "vitest";

import { defaultProjectFormValues } from "@/components/admin/AdminForms";
import { buildProjectPayload } from "./projectPayload";

describe("buildProjectPayload", () => {
  it("keeps selected technologies in create and update payloads", () => {
    const values = {
      ...defaultProjectFormValues,
      title: " Managed project ",
      slug: " managed-project ",
      description: " Project description ",
      technology_ids: ["technology-1", "technology-2"],
    };

    expect(buildProjectPayload(values, true)).toMatchObject({
      slug: "managed-project",
      title: "Managed project",
      description: "Project description",
      technology_ids: ["technology-1", "technology-2"],
    });
    expect(buildProjectPayload(values, false)).not.toHaveProperty("slug");
  });
});

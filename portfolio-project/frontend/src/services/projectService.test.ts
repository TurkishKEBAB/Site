import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "./api";
import { projectService } from "./projectService";

describe("projectService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the public project list without a trailing-slash redirect", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { items: [], total: 0, page: 1, size: 100, pages: 0 },
    });

    await projectService.getProjects({ limit: 100, language: "en" });

    expect(api.get).toHaveBeenCalledWith("/projects", {
      params: { limit: 100, language: "en" },
    });
  });
});

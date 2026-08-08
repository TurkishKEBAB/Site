import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "./api";
import { experienceService } from "./experienceService";

describe("experienceService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts an experience translation to the protected translation endpoint", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({ data: {} });

    await experienceService.addTranslation("experience-1", {
      language: "tr",
      title: "Yazılım Mühendisliği Stajyeri",
      organization: "NETAŞ",
      location: "İstanbul, Türkiye",
      description: "Açıklama",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/experiences/experience-1/translations",
      expect.objectContaining({ language: "tr" }),
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "./api";
import { dossierService } from "./dossierService";

describe("dossierService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads a public dossier by slug and language", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { project_slug: "demo", impact: "impact", metrics: [] },
    });

    await dossierService.getPublicDossier("demo", "tr");

    expect(api.get).toHaveBeenCalledWith("/dossiers/demo", {
      params: { language: "tr" },
    });
  });

  it("saves one complete admin payload", async () => {
    vi.spyOn(api, "put").mockResolvedValueOnce({
      data: { project_id: "p1" },
    });

    await dossierService.upsertDossier("p1", {
      impact_en: "en",
      impact_tr: "tr",
      metrics: [],
      c4: [],
      adrs: [],
      log: [],
      diagrams: [],
      gallery: [],
    });

    expect(api.put).toHaveBeenCalledWith(
      "/dossiers/projects/p1",
      expect.any(Object),
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchGitHubContributions,
  fetchGitHubStats,
  fetchWakaTimeStats,
} from "./systemProfile";

describe("system profile fetches", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a short ISR window for live GitHub and WakaTime snapshots", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      fetchWakaTimeStats(),
      fetchGitHubStats(),
      fetchGitHubContributions(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, options] of fetchMock.mock.calls) {
      expect(options).toMatchObject({ next: { revalidate: 900 } });
    }
  });
});

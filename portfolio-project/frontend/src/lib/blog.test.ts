import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchBlogPosts } from "./blog";

const successfulBlogResponse = {
  items: [
    {
      id: "post-1",
      title: "Post",
      slug: "post",
      content: "Body",
      excerpt: "Excerpt",
      published: true,
      created_at: "2026-04-26T00:00:00.000Z",
      updated_at: "2026-04-26T00:00:00.000Z",
    },
  ],
};

describe("server blog data fetching", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses ISR caching and a timeout signal for the blog list fetch", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(successfulBlogResponse),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchBlogPosts("en")).resolves.toMatchObject({
      degraded: false,
      posts: [{ id: "post-1", published: true }],
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/blog/?published_only=true&language=en&limit=100"),
      expect.objectContaining({
        next: { revalidate: 300 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(fetchSpy.mock.calls[0][1]).not.toHaveProperty("cache", "no-store");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchBlogPostBundle, fetchBlogPostMetadata, fetchBlogPosts } from "./blog";

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
        next: { revalidate: 60 },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("fetches only the post detail needed for metadata", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(successfulBlogResponse.items[0]),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(
      fetchBlogPostMetadata("building-constraint-aware-schedulers", "en"),
    ).resolves.toMatchObject({
      id: "post-1",
      slug: "post",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "/blog/building-constraint-aware-schedulers?language=en&count_view=false",
      ),
      expect.objectContaining({ next: { revalidate: 60 } }),
    );
  });

  it("counts one view for the detail bundle and caches both requests via ISR", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(successfulBlogResponse.items[0]),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(successfulBlogResponse),
      });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchBlogPostBundle("post", "en")).resolves.toMatchObject({
      status: "ok",
      post: { id: "post-1" },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0][0]).toContain("/blog/post?language=en&count_view=true");
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ next: { revalidate: 60 } });
    expect(fetchSpy.mock.calls[1][1]).toMatchObject({ next: { revalidate: 60 } });
  });
});

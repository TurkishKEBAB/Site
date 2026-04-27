import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "./api";
import { blogService } from "./blogService";

describe("blogService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes list payload aliases from the API", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        items: [
          {
            id: "post-1",
            title: "Post",
            slug: "post",
            content: "Body",
            excerpt: "Excerpt",
            is_published: true,
            view_count: "42",
            reading_time: "5",
            created_at: "2026-04-26",
            updated_at: "2026-04-26",
          },
          {
            id: "post-2",
            title: "Post 2",
            slug: "post-2",
            content: "Body",
            excerpt: "Excerpt",
            published: true,
            views: "12",
            read_time: "3",
            created_at: "2026-04-26",
            updated_at: "2026-04-26",
          },
        ],
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      },
    });

    const response = await blogService.getPosts();

    expect(response.items[0]).toMatchObject({
      published: true,
      is_published: true,
      views: 42,
      view_count: 42,
      reading_time: 5,
      read_time: 5,
      is_featured: false,
    });
    expect(response.items[1]).toMatchObject({
      views: 12,
      view_count: 12,
      reading_time: 3,
      read_time: 3,
    });
  });

  it("falls back to an empty list when the API returns a non-array items field", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        items: null,
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      },
    });

    await expect(blogService.getPosts()).resolves.toMatchObject({ items: [] });
  });
});

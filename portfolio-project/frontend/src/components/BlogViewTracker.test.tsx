import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BlogViewTracker from "./BlogViewTracker";

describe("BlogViewTracker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records a view after the detail page has rendered", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    render(<BlogViewTracker slug="post" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/blog/post/view"),
        expect.objectContaining({ method: "POST", keepalive: true }),
      );
    });
  });
});

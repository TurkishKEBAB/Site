import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /resume", () => {
  it("serves the sanitized CV as a PDF attachment", async () => {
    const response = await GET();
    const bytes = new Uint8Array(await response.arrayBuffer());

    expect(response.headers.get("content-type")).toContain("application/pdf");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="yigit-okur-cv.pdf"',
    );
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});

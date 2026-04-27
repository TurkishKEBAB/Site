import { describe, expect, it } from "vitest";

import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("builds stable public list keys without undefined params", () => {
    expect(
      queryKeys.projects.list({
        language: "en",
        featured_only: undefined,
        limit: 6,
      }),
    ).toEqual(["api", "projects", "list", { language: "en", limit: 6 }]);
  });
});

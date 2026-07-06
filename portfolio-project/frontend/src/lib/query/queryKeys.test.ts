import { describe, expect, it } from "vitest";

import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("builds stable public list keys without undefined params", () => {
    const key = queryKeys.projects.list({
      language: "en",
      featured_only: undefined,
      limit: 6,
    });

    expect(key).toEqual(["api", "projects", "list", { language: "en", limit: 6 }]);
  });

  it("sorts params by key so equivalent objects produce identical keys", () => {
    const firstKey = queryKeys.projects.list({
      language: "en",
      featured_only: true,
      limit: 6,
    });
    const secondKey = queryKeys.projects.list({
      limit: 6,
      featured_only: true,
      language: "en",
    });

    expect(JSON.stringify(firstKey)).toBe(JSON.stringify(secondKey));
    expect(JSON.stringify(firstKey)).toBe(
      '["api","projects","list",{"featured_only":true,"language":"en","limit":6}]',
    );
  });
});

import { describe, expect, it, vi } from "vitest";

import { formatAdminDate } from "./format";

describe("formatAdminDate", () => {
  it("formats a date with the requested locale", () => {
    expect(formatAdminDate("2026-04-26T12:30:00Z", "en-US")).toContain("2026");
  });

  it("returns a dash for missing or invalid dates", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(formatAdminDate(null, "en-US")).toBe("—");
    expect(formatAdminDate("not-a-date", "en-US")).toBe("—");
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });
});

import { describe, expect, it } from "vitest";

import { shouldAnimateNexusBackground } from "./NexusBackground";

describe("shouldAnimateNexusBackground", () => {
  it("disables continuous animation for reduced-motion and constrained devices", () => {
    expect(
      shouldAnimateNexusBackground({
        reducedMotion: true,
        saveData: false,
        hardwareConcurrency: 8,
      }),
    ).toBe(false);
    expect(
      shouldAnimateNexusBackground({
        reducedMotion: false,
        saveData: true,
        hardwareConcurrency: 8,
      }),
    ).toBe(false);
    expect(
      shouldAnimateNexusBackground({
        reducedMotion: false,
        saveData: false,
        hardwareConcurrency: 4,
      }),
    ).toBe(false);
  });

  it("keeps animation enabled for a capable device", () => {
    expect(
      shouldAnimateNexusBackground({
        reducedMotion: false,
        saveData: false,
        hardwareConcurrency: 8,
      }),
    ).toBe(true);
  });
});

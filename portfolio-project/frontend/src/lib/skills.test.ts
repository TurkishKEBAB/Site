import { describe, expect, it } from "vitest";

import { toCapabilityGroups, toRadarBlips } from "./skills";

type SkillDomain = "backend" | "cloud" | "product" | "testing" | "research";
type SkillRing = "adopt" | "trial" | "assess" | "hold";

const skill = (
  name: string,
  domain: SkillDomain,
  category: string,
  ring: SkillRing,
  display_order: number,
) => ({
  id: name,
  name,
  category,
  domain,
  ring,
  display_order,
});

describe("live skill transformations", () => {
  it("groups API skills by domain and sorts each group by display order", () => {
    const groups = toCapabilityGroups(
      [
        skill("late", "cloud", "Platforms", "trial", 20),
        skill("first", "cloud", "Platforms", "adopt", 1),
        skill("backend", "backend", "Backend", "assess", 5),
      ],
      "en",
    );

    expect(groups.map((group) => group.domain)).toEqual([
      "backend",
      "cloud",
      "product",
      "testing",
      "research",
    ]);
    expect(groups.find((group) => group.domain === "cloud")?.skills).toEqual([
      "first",
      "late",
    ]);
  });

  it("preserves radar rings and maps categories to deterministic quadrants", () => {
    const blips = toRadarBlips([
      skill("language", "backend", "Languages", "adopt", 1),
      skill("platform", "cloud", "Cloud & DevOps", "trial", 2),
      skill("tool", "cloud", "Tooling", "assess", 3),
      skill("method", "research", "AI & Data", "hold", 4),
    ]);

    expect(blips).toEqual([
      { name: "language", ring: "adopt", quadrant: 0 },
      { name: "platform", ring: "trial", quadrant: 1 },
      { name: "tool", ring: "assess", quadrant: 2 },
      { name: "method", ring: "hold", quadrant: 3 },
    ]);
  });

  it("keeps empty capability domains without inventing static skills", () => {
    const groups = toCapabilityGroups([], "tr");

    expect(groups).toHaveLength(5);
    expect(groups.every((group) => group.skills.length === 0)).toBe(true);
  });
});

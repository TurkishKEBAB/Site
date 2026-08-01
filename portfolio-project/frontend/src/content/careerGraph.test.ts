import { describe, expect, it } from "vitest";

import { careerGraph } from "./careerGraph";

describe("careerGraph", () => {
  it("contains the complete pre-university through current history", () => {
    const ids = new Set(careerGraph.nodes.map((node) => node.id));

    expect([...ids]).toEqual(expect.arrayContaining([
      "frc-finalist",
      "high-school",
      "tubitak-research",
      "university-start",
      "isikschedule",
      "netas-start",
      "ieee-lead",
      "certifications",
      "interests",
      "head",
    ]));
    expect(careerGraph.lanes.map((lane) => lane.id)).toEqual([
      "origin",
      "main",
      "projects",
      "industry",
      "community",
      "signals",
    ]);
    expect(careerGraph.nodes.some((node) => /adalab/i.test(node.title.en))).toBe(false);
  });

  it("gives every branch its own colour and a sorted, in-range time axis", () => {
    const colors = careerGraph.lanes.map((lane) => lane.color);
    expect(new Set(colors).size).toBe(colors.length);

    const marks = careerGraph.axis.map((mark) => mark.t);
    expect(marks).toEqual([...marks].sort((a, b) => a - b));
    for (const mark of careerGraph.axis) {
      expect(mark.t).toBeGreaterThanOrEqual(0);
      expect(mark.t).toBeLessThanOrEqual(100);
    }
  });

  it("keeps graph links attached to real nodes", () => {
    const ids = new Set(careerGraph.nodes.map((node) => node.id));

    for (const link of careerGraph.links) {
      expect(ids.has(link.from)).toBe(true);
      expect(ids.has(link.to)).toBe(true);
    }
  });
});

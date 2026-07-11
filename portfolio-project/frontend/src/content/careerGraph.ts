// Career graph — git-graph model for the About page CareerMap.
// Ported from the YO.sys design system (templates/portfolio-site/data.js).
// TODO(yigit): confirm dates & stories.

export interface CareerLane {
  id: string;
  name: string;
  /** CSS color (design token var or literal). */
  color: string;
  ongoing?: boolean;
}

export interface CareerNode {
  id: string;
  lane: string;
  /** Position along the timeline, 0–100. */
  t: number;
  when: string;
  title: string;
  body?: string;
  kind?: "start" | "head";
}

export interface CareerLink {
  from: string;
  to: string;
}

export interface CareerGraph {
  lanes: CareerLane[];
  nodes: CareerNode[];
  links: CareerLink[];
}

export const careerGraph: CareerGraph = {
  lanes: [
    { id: "main", name: "main · software eng @ isik", color: "var(--primary-400)", ongoing: true },
    { id: "netas", name: "netas · industry", color: "var(--gold-400)" },
    { id: "ieee", name: "ieee · community", color: "var(--status-green)", ongoing: true },
    { id: "adalab", name: "adalab · research", color: "var(--syn-keyword)", ongoing: true },
  ],
  nodes: [
    { id: "enroll", lane: "main", t: 4, when: "Sep 2023", title: "init — Software Engineering, Işık University", body: "Repository initialized. Core CS + engineering track begins.", kind: "start" },
    { id: "core", lane: "main", t: 24, when: "2024", title: "Core curriculum lands", body: "Data structures, OOP, databases, software architecture — the foundations the later systems are built on." },
    { id: "ieee-join", lane: "ieee", t: 36, when: "Oct 2024", title: "branch: IEEE Işık", body: "Joined IEEE Işık — events, workshops, and a growing coordination role." },
    { id: "adalab-start", lane: "adalab", t: 48, when: "2025", title: "branch: AdaLab — applied AI", body: "Research track: LLMs, RAG pipelines, constraint optimization experiments feeding into IsikSchedule and the Agentic IDE thesis." },
    { id: "isik-v1", lane: "main", t: 58, when: "Jun 2025", title: "IsikSchedule v1.0 ships", body: "13-algorithm scheduling core goes live for real course planning — desktop + web from one shared engine." },
    { id: "netas-start", lane: "netas", t: 66, when: "Jan 2026", title: "branch: NETAS — SWE intern", body: "Enterprise Java + ELK stack. Four Jira tickets across production services." },
    { id: "netas-end", lane: "netas", t: 78, when: "Feb 2026", title: "merge: UTC bug traced & locked", body: "25 commits, 1,550 lines of code & tests. Traced a silent UTC vs UTC+3 mismatch through ELK and locked it down with 600+ test lines." },
    { id: "ieee-lead", lane: "ieee", t: 70, when: "2026", title: "IEEE leadership & coordination", body: "Running teams and event delivery — the ownership habits that carry into engineering work." },
    { id: "now", lane: "main", t: 90, when: "Now", title: "HEAD — third year", body: "Building AI-native tooling, keeping quality gates green, open to the next hard problem.", kind: "head" },
  ],
  links: [
    { from: "core", to: "ieee-join" },
    { from: "core", to: "adalab-start" },
    { from: "isik-v1", to: "netas-start" },
    { from: "netas-end", to: "now" },
  ],
};

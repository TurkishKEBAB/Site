import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GitHubDetailView, WakaDetailView } from "./TelemetryDashboard";

describe("live telemetry detail views", () => {
  it("renders GitHub streak data from the contribution response", () => {
    render(
      <GitHubDetailView
        stats={[{ value: "469", label: "Commits" }]}
        contributions={{
          total_contributions: 758,
          cells: [0, 1, 2],
          current_streak: 2,
          longest_streak: 5,
          last_contribution: "2026-08-05",
        }}
        languages={[]}
        detail={{ profile: [] }}
      />,
    );

    expect(screen.getByText("758")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("14")).not.toBeInTheDocument();
  });

  it("renders WakaTime projects and active day from the live response", () => {
    render(
      <WakaDetailView
        stats={[{ value: "10.3", unit: "h", label: "This week" }]}
        languages={[{ name: "Python", percent: 30.3 }]}
        data={{
          projects: [
            { name: "site", percent: 75, seconds: 3600, text: "1 hr" },
          ],
          editors: [],
          most_active_day: {
            date: "2026-08-05",
            seconds: 3600,
            text: "1 hr",
          },
        }}
      />,
    );

    expect(screen.getByText("site")).toBeInTheDocument();
    expect(screen.getAllByText("1 hr")).toHaveLength(2);
    expect(screen.queryByText("6h 31m")).not.toBeInTheDocument();
  });
});

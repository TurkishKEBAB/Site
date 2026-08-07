import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ExpandChip,
  GitHubDetailView,
  TelemetryModal,
  WakaDetailView,
} from "./TelemetryDashboard";

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
        languages={[{ name: "Java", percent: 66.7, color: "#f89820" }]}
        detail={{ profile: [["location", "Istanbul"]] }}
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

  it("handles the expand control and modal lifecycle", () => {
    const onExpand = vi.fn();
    const onClose = vi.fn();

    render(
      <>
        <ExpandChip onClick={onExpand} label="details" />
        <TelemetryModal
          open={false}
          label="Telemetry"
          title="Closed"
          onClose={onClose}
        >
          hidden
        </TelemetryModal>
        <TelemetryModal
          open
          label="Telemetry"
          title="Open"
          meta="live"
          onClose={onClose}
        >
          content
        </TelemetryModal>
      </>,
    );

    const expandButton = screen.getByRole("button", { name: "Expand details details" });
    fireEvent.mouseEnter(expandButton);
    fireEvent.mouseLeave(expandButton);
    fireEvent.click(expandButton);
    expect(onExpand).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: "Open" })).toBeInTheDocument();
    expect(screen.getByText("live")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders live views without fabricating unavailable details", () => {
    render(
      <>
        <WakaDetailView
          stats={[]}
          languages={[]}
          data={{ projects: [], editors: [], most_active_day: null }}
        />
        <GitHubDetailView
          stats={[]}
          contributions={null}
          languages={[]}
          detail={{ profile: [] }}
        />
      </>,
    );

    expect(screen.getAllByText("No live language data.")).toHaveLength(2);
    expect(screen.getByText("No live project data.")).toBeInTheDocument();
    expect(screen.getByText("No live contribution data.")).toBeInTheDocument();
    expect(screen.getByText("No live contribution graph data.")).toBeInTheDocument();
  });
});

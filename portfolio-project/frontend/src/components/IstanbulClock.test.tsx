import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import IstanbulClock from "./IstanbulClock";

describe("IstanbulClock", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("clears the scheduled collapse timer on unmount", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    const { unmount } = render(<IstanbulClock />);

    expect(screen.getByText("IST")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NexusBackground, { shouldAnimateNexusBackground } from "./NexusBackground";

const createContext = () =>
  ({
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
  }) as unknown as CanvasRenderingContext2D;

const createMediaQuery = (
  matches: boolean,
  onChange?: (listener: (event: MediaQueryListEvent) => void) => void,
) =>
  ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        onChange?.(listener),
    ),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList;

beforeEach(() => {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    value: 8,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => createMediaQuery(false)),
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(createContext());
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 320,
    height: 180,
    top: 0,
    right: 320,
    bottom: 180,
    left: 0,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  it("draws a frame, schedules animation, and cancels it during cleanup", () => {
    let nextFrame = 0;
    let callback: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi.fn((next: FrameRequestCallback) => {
      callback = next;
      nextFrame += 1;
      return nextFrame;
    });
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const { unmount } = render(<NexusBackground />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      callback?.(1000);
    });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("draws a static frame without scheduling animation for reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue(createMediaQuery(true));
    const requestAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);

    render(<NexusBackground />);

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("stops and restarts animation when motion preference changes", () => {
    let onMotionChange: ((event: MediaQueryListEvent) => void) | undefined;
    const motionQuery = createMediaQuery(false, (listener) => {
      onMotionChange = listener;
    });
    vi.mocked(window.matchMedia).mockReturnValue(motionQuery);

    let nextFrame = 0;
    const requestAnimationFrame = vi.fn(() => {
      nextFrame += 1;
      return nextFrame;
    });
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const { unmount } = render(<NexusBackground />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      onMotionChange?.({ matches: true } as MediaQueryListEvent);
    });

    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      onMotionChange?.({ matches: false } as MediaQueryListEvent);
    });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    unmount();
  });
});

import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TurnstileWidget from "./TurnstileWidget";

interface RenderOptions {
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => boolean;
}

describe("TurnstileWidget", () => {
  beforeEach(() => {
    delete (window as unknown as { turnstile?: unknown }).turnstile;
    document.getElementById("cloudflare-turnstile-script")?.remove();
  });

  it("forwards challenge lifecycle events and removes the widget on unmount", async () => {
    let options: RenderOptions | undefined;
    const turnstile = {
      render: vi.fn((_container: HTMLElement, nextOptions: RenderOptions) => {
        options = nextOptions;
        return "widget-id";
      }),
      remove: vi.fn(),
    };
    Object.defineProperty(window, "turnstile", {
      configurable: true,
      value: turnstile,
    });
    const onToken = vi.fn();
    const onError = vi.fn();

    const { unmount } = render(
      <TurnstileWidget siteKey="site-key" onToken={onToken} onError={onError} />,
    );

    await waitFor(() => {
      expect(turnstile.render).toHaveBeenCalled();
    });

    options?.callback("token");
    options?.["expired-callback"]();
    expect(options?.["error-callback"]()).toBe(true);

    expect(onToken).toHaveBeenNthCalledWith(1, "token");
    expect(onToken).toHaveBeenNthCalledWith(2, "");
    expect(onError).toHaveBeenCalledOnce();

    unmount();

    expect(turnstile.remove).toHaveBeenCalledWith("widget-id");
  });

  it("reports an external Turnstile script loading failure", async () => {
    const onError = vi.fn();

    render(<TurnstileWidget siteKey="site-key" onToken={vi.fn()} onError={onError} />);

    const script = document.getElementById("cloudflare-turnstile-script");
    expect(script).toHaveAttribute(
      "src",
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    );

    fireEvent.error(script as HTMLScriptElement);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });
  });

  it("waits for an already-added Turnstile script", async () => {
    const script = document.createElement("script");
    script.id = "cloudflare-turnstile-script";
    document.head.appendChild(script);

    const turnstile = {
      render: vi.fn(() => "widget-id"),
    };
    const onError = vi.fn();

    render(<TurnstileWidget siteKey="site-key" onToken={vi.fn()} onError={onError} />);
    Object.defineProperty(window, "turnstile", {
      configurable: true,
      value: turnstile,
    });
    fireEvent.load(script);

    await waitFor(() => {
      expect(turnstile.render).toHaveBeenCalled();
    });
    expect(onError).not.toHaveBeenCalled();
  });
});

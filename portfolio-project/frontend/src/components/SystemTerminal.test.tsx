import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import SystemTerminal from "./SystemTerminal";

const openShell = () => {
  fireEvent.click(screen.getByRole("tab", { name: "shell" }));
  return screen.getByRole("textbox", { name: "Shell input" });
};

const run = (input: HTMLElement, command: string) => {
  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: "Enter" });
};

describe("SystemTerminal", () => {
  afterEach(() => cleanup());
  it("uses a stable uptime value for the initial server-safe render", () => {
    const html = renderToStaticMarkup(<SystemTerminal />);

    expect(html).toContain("0d 00:00:00");
  });

  it("uses the optimized profile asset by default", () => {
    render(<SystemTerminal />);

    expect(screen.getByRole("img", { name: "Yiğit Okur" })).toHaveAttribute(
      "src",
      "/profile-zurich.webp",
    );
    expect(screen.getByRole("img", { name: "Yiğit Okur" })).toHaveAttribute(
      "fetchpriority",
      "high",
    );
  });

  it("wires the tabs together for assistive technology", () => {
    render(<SystemTerminal />);

    const shellTab = screen.getByRole("tab", { name: "shell" });
    expect(shellTab).toHaveAttribute("aria-controls", "nx-panel-shell");
    // Only the selected tab is in the tab order; arrows move between them.
    expect(shellTab).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(screen.getByRole("tab", { name: "yofetch" }), { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Profile.java" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "nx-tab-java");
  });

  it("numbers the Profile.java source and reports its length", () => {
    render(<SystemTerminal />);

    fireEvent.click(screen.getByRole("tab", { name: "Profile.java" }));

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText(/17 lines/)).toBeInTheDocument();

    // The gutter is the only decorative column in the panel, so it can be read
    // back directly — `getByText` would also match digits inside the source.
    const gutter = Array.from(panel.querySelectorAll('span[aria-hidden="true"]'));
    expect(gutter.map((cell) => cell.textContent)).toEqual(
      Array.from({ length: 17 }, (_, index) => String(index + 1)),
    );
  });

  it("focuses the prompt when the shell tab opens", async () => {
    render(<SystemTerminal />);

    const input = openShell();

    await waitFor(() => expect(input).toHaveFocus());
  });

  it("recalls previous commands with the arrow keys", () => {
    render(<SystemTerminal />);
    const input = openShell();

    run(input, "whoami");
    run(input, "pwd");
    expect(input).toHaveValue("");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("pwd");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("whoami");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("pwd");
    // Walking past the newest entry returns to an empty prompt.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("");
  });

  it("completes a command from a unique prefix", () => {
    render(<SystemTerminal />);
    const input = openShell();

    fireEvent.change(input, { target: { value: "whoa" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(input).toHaveValue("whoami");
  });

  it("completes to the shared prefix and lists ambiguous matches", () => {
    render(<SystemTerminal />);
    const input = openShell();

    fireEvent.change(input, { target: { value: "j" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(input).toHaveValue("java");
    expect(screen.getByText(/javac Profile\.java\s+java Profile/)).toBeInTheDocument();
  });

  it("answers the new informational commands", () => {
    render(<SystemTerminal />);
    const input = openShell();

    run(input, "whoami");
    expect(screen.getByText("yigit")).toBeInTheDocument();

    run(input, "pwd");
    expect(screen.getByText("/home/yigit/yo-sys")).toBeInTheDocument();
  });

  it("turns `open` into a real link and rejects unknown pages", () => {
    render(<SystemTerminal />);
    const input = openShell();

    run(input, "open projects");
    expect(screen.getByRole("link", { name: "/projects" })).toHaveAttribute("href", "/projects");

    run(input, "open nowhere");
    expect(screen.getByText(/open: unknown page/)).toBeInTheDocument();
  });

  it("refuses to run the class before it is compiled", () => {
    render(<SystemTerminal />);
    const input = openShell();

    run(input, "java Profile");

    expect(screen.getByText(/Could not find or load main class/)).toBeInTheDocument();
  });
});

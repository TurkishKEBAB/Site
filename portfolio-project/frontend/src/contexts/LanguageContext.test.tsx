import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LanguageProvider, useLanguage } from "./LanguageContext";

function LanguageProbe() {
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <span data-testid="current-language">{language}</span>
      <button type="button" onClick={() => setLanguage("tr")}>
        switch-to-tr
      </button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "preferred-locale=; path=/; max-age=0";
    document.documentElement.lang = "en";
  });

  afterEach(() => {
    cleanup();
  });

  it("resolves the persisted locale from localStorage on mount", () => {
    window.localStorage.setItem("lang", "tr");

    render(
      <LanguageProvider initialLanguage="en">
        <LanguageProbe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("current-language").textContent).toBe("tr");
  });

  it("keeps the user's selection instead of reverting to the stored locale", async () => {
    // Regression: the mount-time resolution effect used to re-run on every
    // `language` change, read the stale "en" from storage, and stomp the
    // user's "tr" selection back to "en".
    window.localStorage.setItem("lang", "en");

    render(
      <LanguageProvider initialLanguage="en">
        <LanguageProbe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("current-language").textContent).toBe("en");

    await act(async () => {
      screen.getByText("switch-to-tr").click();
    });

    expect(screen.getByTestId("current-language").textContent).toBe("tr");
    expect(window.localStorage.getItem("lang")).toBe("tr");
    expect(document.documentElement.lang).toBe("tr");
    expect(document.cookie).toContain("preferred-locale=tr");
  });
});

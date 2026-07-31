import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import PublicLayout from "../../app/(public)/layout";

vi.mock("@/components/NexusBackground", () => ({
  default: () => null,
}));

vi.mock("@/components/Navigation", () => ({
  default: () => null,
}));

vi.mock("@/components/Footer", () => ({
  default: () => null,
}));

describe("public layout", () => {
  it("renders the intro for direct deep-link visits", () => {
    const html = renderToStaticMarkup(
      <PublicLayout>
        <div>Projects route</div>
      </PublicLayout>,
    );

    expect(html).toContain('aria-label="Skip intro"');
  });
});

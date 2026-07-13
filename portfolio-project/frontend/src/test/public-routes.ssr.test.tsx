import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import About from "@/routes/About";
import Contact from "@/routes/Contact";
import Home from "@/routes/Home";
import Projects from "@/routes/Projects";
import { aboutContent, contactContent, homeContent } from "@/content/site";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/AnimatedSection", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ContactForm", () => ({
  default: () => <div data-testid="contact-form">contact-form</div>,
}));

vi.mock("@/hooks/usePublicData", () => ({
  useSkillsQuery: () => ({
    data: [
      {
        id: "managed-skill",
        name: "Managed skill",
        category: "Tools",
        domain: "cloud",
        ring: "trial",
        display_order: 1,
      },
    ],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useProjectsQuery: () => ({
    data: {
      items: [
        {
          id: "managed-project",
          slug: "managed-project",
          title: "Managed project title",
          short_description: "Managed project summary",
          description: "Managed project description",
          technologies: [{ id: "technology-1", name: "FastAPI", slug: "fastapi" }],
          featured: true,
          display_order: 1,
          created_at: "2026-07-13T12:00:00Z",
          updated_at: "2026-07-13T12:00:00Z",
        },
      ],
    },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useProjectDossierQuery: () => ({
    data: null,
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe("public route SSR", () => {
  it("renders the home route with static impact content", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<Home locale={locale} />);

    expect(html).toContain(homeContent[locale].heroTitleFirst);
    expect(html).toContain("yofetch");
    expect(html).toContain("Profile.java");
    expect(html).toContain("Command center");
    expect(html).toContain("Featured systems");
    expect(html).toContain(homeContent[locale].secondaryCta);
    expect(html).not.toContain("Loading");
  });

  it("renders the about route with scannable highlight content", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<About locale={locale} />);

    expect(html).toContain(aboutContent[locale].pageSubtitle);
    expect(html).toContain("Current signal");
    expect(html).toContain("Career map");
    expect(html).toContain("Tech radar");
    expect(html).toContain("Delivery with scale");
    expect(html).toContain("Managed skill");
    expect(html).not.toContain("No experience found");
  });

  it("renders the projects route with managed API records", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<Projects locale={locale} />);

    expect(html).toContain("Archive");
    expect(html).toContain("All systems");
    expect(html).toContain("Managed project title");
    expect(html).toContain("Managed project summary");
    expect(html).not.toContain("No featured project");
  });

  it("renders the contact route with direct channels even without API data", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<Contact locale={locale} />);

    expect(html).toContain(contactContent[locale].pageTitle);
    expect(html).toContain("yigitokur@ieee.org");
    expect(html).toContain("contact-form");
    expect(html).not.toContain("No contact");
  });
});

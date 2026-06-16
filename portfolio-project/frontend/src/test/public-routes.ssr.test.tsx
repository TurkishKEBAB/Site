import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import About from "@/routes/About";
import Contact from "@/routes/Contact";
import Home from "@/routes/Home";
import Projects from "@/routes/Projects";
import { aboutContent, contactContent, homeContent, projectRecords } from "@/content/site";

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

vi.mock("@/components/ProjectExplorer", () => ({
  default: ({ projects }: { projects: Array<{ title: string }> }) => (
    <div data-testid="project-explorer">
      {projects.map((project) => (
        <span key={project.title}>{project.title}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ContactForm", () => ({
  default: () => <div data-testid="contact-form">contact-form</div>,
}));

describe("public route SSR", () => {
  it("renders the home route with static impact content", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<Home locale={locale} />);

    expect(html).toContain(homeContent[locale].heroTitleFirst);
    expect(html).toContain("Profile.java");
    expect(html).toContain("PowerShell");
    expect(html).toContain("Command center");
    expect(html).toContain(homeContent[locale].overviewCards[0].title);
    expect(html).toContain(homeContent[locale].secondaryCta);
    expect(html).not.toContain("Loading");
  });

  it("renders the about route with scannable highlight content", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<About locale={locale} />);

    expect(html).toContain(aboutContent[locale].pageSubtitle);
    expect(html).toContain("Current signal");
    expect(html).toContain("Career timeline");
    expect(html).toContain("Tech radar");
    expect(html).toContain("Delivery with scale");
    expect(html).not.toContain("No experience found");
  });

  it("renders the projects route with curated project records", () => {
    const locale = "en";
    const html = renderToStaticMarkup(<Projects locale={locale} />);

    expect(html).toContain("IsikSchedule architecture");
    expect(html).toContain("Detailed project slice");
    expect(html).toContain(projectRecords[0].title[locale]);
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

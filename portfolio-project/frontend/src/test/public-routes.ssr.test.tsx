import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import About from "@/routes/About";
import Contact from "@/routes/Contact";
import Home from "@/routes/Home";
import Projects from "@/routes/Projects";

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
    const html = renderToStaticMarkup(<Home locale="en" />);

    expect(html).toContain("YIGIT");
    expect(html).toContain("NETAS timezone investigation");
    expect(html).toContain("Download CV");
    expect(html).not.toContain("Loading");
  });

  it("renders the about route with scannable highlight content", () => {
    const html = renderToStaticMarkup(<About locale="en" />);

    expect(html).toContain("A software engineering student building durable backend systems");
    expect(html).toContain("Delivery with scale");
    expect(html).not.toContain("No experience found");
  });

  it("renders the projects route with curated project records", () => {
    const html = renderToStaticMarkup(<Projects locale="en" />);

    expect(html).toContain("Detailed project slice");
    expect(html).toContain("IsikSchedule");
    expect(html).not.toContain("No featured project");
  });

  it("renders the contact route with direct channels even without API data", () => {
    const html = renderToStaticMarkup(<Contact locale="en" />);

    expect(html).toContain("Get in touch");
    expect(html).toContain("yigitokur@ieee.org");
    expect(html).toContain("contact-form");
    expect(html).not.toContain("No contact");
  });
});

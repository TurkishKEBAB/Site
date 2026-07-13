import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminProject } from "@/components/admin/types";
import type { BlogPost } from "@/services/types";
import type { Technology } from "@/services/technologyService";
import {
  BlogTab,
  DashboardTab,
  ExperiencesTab,
  MessagesTab,
  ProjectsTab,
  SkillsTab,
  TechnologiesTab,
} from "./index";

const projectText = {
  projectManagement: "Projects Management",
  addProject: "Add Project",
  translate: "Translations",
  images: "Images",
  edit: "Edit",
  delete: "Delete",
  deleting: "Deleting...",
  yes: "Yes",
  no: "No",
};

const skillText = {
  skillManagement: "Skills Management",
  addSkill: "Add Skill",
  edit: "Edit",
  delete: "Delete",
};

const experienceText = {
  experienceManagement: "Experiences Management",
  addExperience: "Add Experience",
  edit: "Edit",
  delete: "Delete",
};

const messageText = {
  incomingMessages: "Incoming Messages",
  delete: "Delete",
  deleting: "Deleting...",
};

const blogText = {
  blogManagement: "Blog Management",
  addBlogPost: "Add Blog Post",
  blogTranslations: "Translations",
  published: "Published",
  draft: "Draft",
  edit: "Edit",
  delete: "Delete",
  deleting: "Deleting...",
  yes: "Yes",
  no: "No",
};

const technologyText = {
  technologyManagement: "Technology Management",
  addTechnology: "Add Technology",
  edit: "Edit",
  delete: "Delete",
  deleting: "Deleting...",
  technologyLoading: "Loading technologies...",
  noTechnologies: "No technologies found.",
};

const baseProject: AdminProject = {
  id: "project-1",
  title: "Portfolio Site",
  slug: "portfolio-site",
  shortDescription: "Short",
  description: "Long",
  coverImage: null,
  githubUrl: null,
  demoUrl: null,
  featured: true,
  displayOrder: 2,
  updatedAt: "2026-04-26T12:00:00Z",
  createdAt: "2026-04-20T12:00:00Z",
};

const baseBlogPost: BlogPost = {
  id: "post-1",
  title: "Published note",
  slug: "published-note",
  content: "Body",
  excerpt: "Excerpt",
  published: true,
  views: 4,
  reading_time: 3,
  tags: ["fastapi"],
  created_at: "2026-07-13T12:00:00Z",
  updated_at: "2026-07-13T12:00:00Z",
};

const baseTechnology: Technology = {
  id: "technology-1",
  name: "FastAPI",
  slug: "fastapi",
  icon: "fastapi",
  category: "Backend",
  color: "#009688",
  created_at: "2026-07-13T12:00:00Z",
};

describe("admin tab components", () => {
  it("renders technologies and forwards create, edit, and delete actions", () => {
    const onCreate = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TechnologiesTab
        text={technologyText}
        technologies={[baseTechnology]}
        technologiesLoading={false}
        technologyActionId={null}
        onCreateTechnology={onCreate}
        onEditTechnology={onEdit}
        onDeleteTechnology={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Technology" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("FastAPI")).toBeInTheDocument();
    expect(screen.getAllByText("fastapi").length).toBeGreaterThanOrEqual(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(baseTechnology);
    expect(onDelete).toHaveBeenCalledWith("technology-1");
  });

  it("renders technology loading and empty states", () => {
    const noop = vi.fn();
    const { rerender } = render(
      <TechnologiesTab
        text={technologyText}
        technologies={[]}
        technologiesLoading
        technologyActionId={null}
        onCreateTechnology={noop}
        onEditTechnology={noop}
        onDeleteTechnology={noop}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    rerender(
      <TechnologiesTab
        text={technologyText}
        technologies={[]}
        technologiesLoading={false}
        technologyActionId={null}
        onCreateTechnology={noop}
        onEditTechnology={noop}
        onDeleteTechnology={noop}
      />,
    );

    expect(screen.getByText(/no technologies/i)).toBeInTheDocument();
  });

  it("renders Blog rows and forwards create, edit, delete, and translation actions", () => {
    const onCreate = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onTranslate = vi.fn();

    render(
      <BlogTab
        text={blogText}
        posts={[{ ...baseBlogPost, title: "Draft note", published: false }]}
        postsLoading={false}
        postActionId={null}
        dateLocale="en-US"
        onCreatePost={onCreate}
        onEditPost={onEdit}
        onDeletePost={onDelete}
        onOpenTranslationManager={onTranslate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Blog Post" }));
    fireEvent.click(screen.getByRole("button", { name: "Translations" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onTranslate).toHaveBeenCalledWith(expect.objectContaining({ id: "post-1" }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "post-1" }));
    expect(onDelete).toHaveBeenCalledWith("post-1");
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders dashboard copy with the current admin username", () => {
    render(<DashboardTab text={{ welcomeUser: "Welcome" }} username="Ada" />);

    expect(screen.getByRole("heading", { name: /Welcome, Ada/ })).toBeInTheDocument();
    expect(screen.getByText(/Backend/)).toBeInTheDocument();
  });

  it("renders projects and wires row actions", () => {
    const onCreateProject = vi.fn();
    const onEditProject = vi.fn();
    const onDeleteProject = vi.fn();
    const onOpenImageManager = vi.fn();
    const onOpenTranslationManager = vi.fn();

    render(
      <ProjectsTab
        text={projectText}
        projects={[
          baseProject,
          {
            ...baseProject,
            id: "project-2",
            title: "Archive",
            slug: "archive",
            featured: false,
            updatedAt: null,
          },
        ]}
        projectsLoading={false}
        projectActionId="project-2"
        dateLocale="en-US"
        onCreateProject={onCreateProject}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        onOpenImageManager={onOpenImageManager}
        onOpenTranslationManager={onOpenTranslationManager}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Project" }));
    expect(onCreateProject).toHaveBeenCalledTimes(1);

    const firstRow = screen.getByText("Portfolio Site").closest("tr");
    expect(firstRow).not.toBeNull();
    const firstRowActions = within(firstRow as HTMLTableRowElement);

    fireEvent.click(firstRowActions.getByRole("button", { name: /Translations/ }));
    fireEvent.click(firstRowActions.getByRole("button", { name: /Images/ }));
    fireEvent.click(firstRowActions.getByRole("button", { name: "Edit" }));
    fireEvent.click(firstRowActions.getByRole("button", { name: "Delete" }));

    expect(onOpenTranslationManager).toHaveBeenCalledWith(baseProject);
    expect(onOpenImageManager).toHaveBeenCalledWith(baseProject);
    expect(onEditProject).toHaveBeenCalledWith(baseProject);
    expect(onDeleteProject).toHaveBeenCalledWith(baseProject);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });

  it("renders project loading and empty states", () => {
    const noop = vi.fn();
    const { rerender } = render(
      <ProjectsTab
        text={projectText}
        projects={[]}
        projectsLoading
        projectActionId={null}
        dateLocale="en-US"
        onCreateProject={noop}
        onEditProject={noop}
        onDeleteProject={noop}
        onOpenImageManager={noop}
        onOpenTranslationManager={noop}
      />,
    );

    expect(screen.getByText(/Projeler/)).toBeInTheDocument();

    rerender(
      <ProjectsTab
        text={projectText}
        projects={[]}
        projectsLoading={false}
        projectActionId={null}
        dateLocale="en-US"
        onCreateProject={noop}
        onEditProject={noop}
        onDeleteProject={noop}
        onOpenImageManager={noop}
        onOpenTranslationManager={noop}
      />,
    );

    expect(screen.getByText(/hen/)).toBeInTheDocument();
  });

  it("renders skills and triggers skill actions", () => {
    const onCreateSkill = vi.fn();
    const onEditSkill = vi.fn();
    const onDeleteSkill = vi.fn();

    render(
      <SkillsTab
        text={skillText}
        skills={[
          {
            id: "skill-1",
            name: "TypeScript",
            category: "Frontend",
            domain: "product",
            ring: "adopt",
            order_index: 1,
          },
        ]}
        skillsLoading={false}
        onCreateSkill={onCreateSkill}
        onEditSkill={onEditSkill}
        onDeleteSkill={onDeleteSkill}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Skill" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("product")).toBeInTheDocument();
    expect(screen.getByText("adopt")).toBeInTheDocument();
    expect(onCreateSkill).toHaveBeenCalledTimes(1);
    expect(onEditSkill).toHaveBeenCalledWith(expect.objectContaining({ id: "skill-1" }));
    expect(onDeleteSkill).toHaveBeenCalledWith("skill-1");
  });

  it("renders experience date branches and actions", () => {
    const onCreateExperience = vi.fn();
    const onEditExperience = vi.fn();
    const onDeleteExperience = vi.fn();

    render(
      <ExperiencesTab
        text={experienceText}
        experiences={[
          {
            id: "exp-1",
            title: "Engineer",
            organization: "Cloud Co",
            experience_type: "work",
            start_date: "2026-01-01",
            end_date: undefined,
            is_current: true,
            display_order: 1,
            translations: [],
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
          {
            id: "exp-2",
            title: "Volunteer",
            organization: "Open Org",
            experience_type: "volunteer",
            start_date: "2025-01-01",
            end_date: "2025-06-01",
            is_current: false,
            display_order: 2,
            translations: [],
            created_at: "2025-01-01",
            updated_at: "2025-06-01",
          },
        ]}
        experiencesLoading={false}
        adminLanguage="en"
        dateLocale="en-US"
        onCreateExperience={onCreateExperience}
        onEditExperience={onEditExperience}
        onDeleteExperience={onDeleteExperience}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Experience" }));
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(editButtons[0]);
    fireEvent.click(deleteButtons[1]);

    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Ongoing/)).toBeInTheDocument();
    expect(onCreateExperience).toHaveBeenCalledTimes(1);
    expect(onEditExperience).toHaveBeenCalledWith(expect.objectContaining({ id: "exp-1" }));
    expect(onDeleteExperience).toHaveBeenCalledWith("exp-2");
  });

  it("renders message states and triggers message actions", () => {
    const onMarkAsRead = vi.fn();
    const onDeleteMessage = vi.fn();

    render(
      <MessagesTab
        text={messageText}
        messages={[
          {
            id: "message-1",
            name: "Grace",
            email: "grace@example.com",
            subject: "Platform",
            message: "Hello",
            is_read: false,
            is_replied: false,
            created_at: "2026-04-26T12:00:00Z",
          },
          {
            id: "message-2",
            name: "Linus",
            email: "linus@example.com",
            subject: "Systems",
            message: "Hi",
            is_read: true,
            is_replied: true,
            created_at: "2026-04-25T12:00:00Z",
          },
          {
            id: "message-3",
            name: "Margaret",
            email: "margaret@example.com",
            subject: "Apollo",
            message: "Hi",
            is_read: true,
            is_replied: false,
            created_at: "2026-04-24T12:00:00Z",
          },
        ]}
        messagesLoading={false}
        messageActionId="message-2"
        dateLocale="en-US"
        onMarkAsRead={onMarkAsRead}
        onDeleteMessage={onDeleteMessage}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Okundu" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Yanıtlandı")).toBeInTheDocument();
    expect(screen.getAllByText("Okundu")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
    expect(onMarkAsRead).toHaveBeenCalledWith("message-1");
    expect(onDeleteMessage).toHaveBeenCalledWith("message-1");
  });
});

import type { ContactMessageResponse } from "@/services/contactService";
import type { Experience, Skill } from "@/services/types";

export type AdminTabId = "dashboard" | "projects" | "technologies" | "blog" | "skills" | "experiences" | "messages";

export interface Stats {
  projects: number;
  skills: number;
  experiences: number;
  messages: number;
  unreadMessages: number;
}

export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  displayOrder: number;
  updatedAt: string | null;
  createdAt: string | null;
  technologies?: Array<{ id: string; name: string; slug: string }>;
}

export interface AdminCopy {
  loading: string;
  adminPanel: string;
  welcome: string;
  logout: string;
  dashboard: string;
  projects: string;
  technologies: string;
  skills: string;
  experiences: string;
  messages: string;
  yes: string;
  no: string;
  unreadSuffix: string;
  allViewed: string;
  welcomeUser: string;
  projectManagement: string;
  technologyManagement: string;
  skillManagement: string;
  experienceManagement: string;
  incomingMessages: string;
  addProject: string;
  addTechnology: string;
  addSkill: string;
  addExperience: string;
  edit: string;
  delete: string;
  deleting: string;
  translate: string;
  images: string;
  dossier: string;
  sessionExpired: string;
  blogManagement: string;
  addBlogPost: string;
  blogTranslations: string;
  published: string;
  draft: string;
  technologyLoading: string;
  noTechnologies: string;
}

export type AdminSkill = Skill;
export type AdminExperience = Experience;
export type AdminMessage = ContactMessageResponse;

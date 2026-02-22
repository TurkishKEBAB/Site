// API Response Types

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  cover_image?: string;
  demo_url?: string;
  github_url?: string;
  technologies: Technology[];
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Optional fields for backward compatibility
  translations?: any[];
  images?: any[];
  project_technologies?: any[];
}

export interface ProjectCreate {
  title: string;
  description: string;
  long_description?: string;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  technology_ids: string[];
  featured?: boolean;
}

// Technology Types
export interface Technology {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  category?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  tags?: string[];
  published: boolean;
  is_published?: boolean;
  is_featured?: boolean;
  views: number;
  view_count?: number;
  reading_time?: number;
  read_time?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  published?: boolean;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;  // Backend uses proficiency (0-100)
  icon?: string;
  icon_url?: string;
  color?: string;
  order_index: number;
}

export interface SkillCreate {
  name: string;
  category: string;
  proficiency: number;
  icon_url?: string | null;
  color?: string;
  order_index?: number;
}

export interface SkillUpdate {
  name?: string;
  category?: string;
  proficiency?: number;
  icon_url?: string | null;
  color?: string;
  order_index?: number;
}

// Experience Types
export interface ExperienceTranslation {
  id: string;
  experience_id: string;
  language: string;
  title: string;
  organization: string;
  location?: string;
  description?: string;
  created_at: string;
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  location?: string;
  experience_type: 'education' | 'work' | 'volunteer' | 'activity';
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  display_order: number;
  translations: ExperienceTranslation[];
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  title: string;
  organization: string;
  location?: string;
  experience_type: 'education' | 'work' | 'volunteer' | 'activity';
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  display_order?: number;
}

export interface ExperienceListResponse {
  experiences: Experience[];
  total: number;
  skip: number;
  limit: number;
}

// Contact Types
export interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// GitHub Types
export interface GitHubRepo {
  name: string;
  description?: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
}

export interface GitHubStats {
  total_repos: number;
  total_stars: number;
  total_forks: number;
  languages: { [key: string]: number };
}

// Translation Types
export interface Translation {
  key: string;
  en: string;
  tr: string;
  de: string;
  es: string;
}

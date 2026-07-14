import type { Locale } from "@/content/site";
import type { BlogPost } from "@/services/types";

export type BlogStatus = "ok" | "not_found" | "unavailable";

export interface BlogPostBundle {
  post: BlogPost | null;
  relatedPosts: BlogPost[];
  latestPosts: BlogPost[];
  status: BlogStatus;
}

const emptyBlogPosts: BlogPost[] = [];
// Must cover the backend's serverless cold start (measured ~14s when the
// Railway service wakes from sleep); 1.5s aborted nearly every request.
const BLOG_FETCH_TIMEOUT_MS = 15_000;
const BLOG_REVALIDATE_SECONDS = 60;

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

const normalizeBlogPost = (post: BlogPost): BlogPost => ({
  ...post,
  published: typeof post.published === "boolean" ? post.published : Boolean(post.is_published),
  is_published:
    typeof post.is_published === "boolean" ? post.is_published : Boolean(post.published),
  views: typeof post.views === "number" ? post.views : Number(post.view_count || 0),
  view_count:
    typeof post.view_count === "number" ? post.view_count : Number(post.views || 0),
  reading_time:
    typeof post.reading_time === "number"
      ? post.reading_time
      : post.read_time
        ? Number(post.read_time)
        : undefined,
  read_time:
    typeof post.read_time === "number"
      ? post.read_time
      : post.reading_time
        ? Number(post.reading_time)
        : undefined,
  is_featured: Boolean(post.is_featured),
});

const buildUrl = (pathname: string, params?: Record<string, string | number | boolean>) => {
  const url = new URL(`${getApiBaseUrl()}${pathname}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const createTimeoutSignal = () => {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(BLOG_FETCH_TIMEOUT_MS);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), BLOG_FETCH_TIMEOUT_MS);
  return controller.signal;
};

async function fetchJson<T>(url: string): Promise<{ status: number; data: T | null }> {
  // ISR instead of no-store: a successful response is cached and served
  // stale-while-revalidate, so a sleeping backend no longer blanks the blog.
  const response = await fetch(url, {
    next: { revalidate: BLOG_REVALIDATE_SECONDS },
    signal: createTimeoutSignal(),
  });

  if (!response.ok) {
    return { status: response.status, data: null };
  }

  const data = (await response.json()) as T;
  return { status: response.status, data };
}

const buildEmptyBundle = (status: BlogStatus): BlogPostBundle => ({
  post: null,
  relatedPosts: emptyBlogPosts,
  latestPosts: emptyBlogPosts,
  status,
});

const sortPostsByCreatedAt = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );

const buildRelatedPosts = (post: BlogPost, posts: BlogPost[]): BlogPost[] =>
  posts
    .filter(
      (candidate) =>
        candidate.id !== post.id && candidate.tags?.some((tag) => post.tags?.includes(tag)),
    )
    .slice(0, 3);

const buildLatestPosts = (post: BlogPost, posts: BlogPost[]): BlogPost[] =>
  sortPostsByCreatedAt(posts.filter((candidate) => candidate.id !== post.id)).slice(0, 3);

export async function fetchBlogPosts(locale: Locale): Promise<{
  posts: BlogPost[];
  degraded: boolean;
}> {
  try {
    const response = await fetchJson<{ items?: BlogPost[] }>(
      buildUrl("/blog/", {
        published_only: true,
        language: locale,
        limit: 100,
      }),
    );

    if (!response.data?.items) {
      return { posts: emptyBlogPosts, degraded: true };
    }

    return {
      posts: response.data.items.map(normalizeBlogPost),
      degraded: false,
    };
  } catch (error) {
    console.error("Failed to fetch blog posts", error);
    return { posts: emptyBlogPosts, degraded: true };
  }
}

export async function fetchBlogPostMetadata(
  slug: string,
  locale: Locale,
): Promise<BlogPost | null> {
  try {
    const response = await fetchJson<BlogPost>(
      buildUrl(`/blog/${slug}`, {
        language: locale,
        count_view: false,
      }),
    );

    if (!response.data) {
      return null;
    }

    return normalizeBlogPost(response.data);
  } catch (error) {
    console.error("Failed to fetch blog metadata", error);
    return null;
  }
}

export async function fetchBlogPostBundle(
  slug: string,
  locale: Locale,
): Promise<BlogPostBundle> {
  try {
    const postResponse = await fetchJson<BlogPost>(
      buildUrl(`/blog/${slug}`, {
        language: locale,
        count_view: true,
      }),
    );

    if (postResponse.status === 404) {
      return buildEmptyBundle("not_found");
    }

    if (!postResponse.data) {
      return buildEmptyBundle("unavailable");
    }

    const post = normalizeBlogPost(postResponse.data);
    const { posts, degraded } = await fetchBlogPosts(locale);

    return {
      post,
      relatedPosts: buildRelatedPosts(post, posts),
      latestPosts: buildLatestPosts(post, posts),
      status: degraded ? "unavailable" : "ok",
    };
  } catch (error) {
    console.error("Failed to fetch blog detail", error);
    return buildEmptyBundle("unavailable");
  }
}

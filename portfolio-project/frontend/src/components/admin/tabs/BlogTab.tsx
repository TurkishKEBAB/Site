import type { BlogPost } from "@/services/types";

import type { AdminCopy } from "../types";
import { formatAdminDate } from "@/lib/admin/format";

interface BlogTabProps {
  text: Pick<
    AdminCopy,
    | "blogManagement"
    | "addBlogPost"
    | "blogTranslations"
    | "published"
    | "draft"
    | "edit"
    | "delete"
    | "deleting"
  >;
  posts: BlogPost[];
  postsLoading: boolean;
  postActionId: string | null;
  dateLocale: string;
  onCreatePost: () => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  onOpenTranslationManager: (post: BlogPost) => void;
}

export function BlogTab({
  text,
  posts,
  postsLoading,
  postActionId,
  dateLocale,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onOpenTranslationManager,
}: BlogTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="sys-label flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400">//</span> CONTENT.BLOG
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-dark-50">
            {text.blogManagement}
          </h2>
        </div>
        <button type="button" onClick={onCreatePost} className="btn-primary">
          {text.addBlogPost}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-gray-400 dark:text-dark-400">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
            {postsLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-dark-400">
                  Loading blog posts...
                </td>
              </tr>
            ) : null}

            {!postsLoading && posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-dark-400">
                  No blog posts yet.
                </td>
              </tr>
            ) : null}

            {!postsLoading
              ? posts.map((post) => (
                  <tr key={post.id} className="hover:bg-primary-400/[0.04]">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-100">
                      {post.title || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-dark-300">
                      {post.slug || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${post.published ? "bg-emerald-400" : "bg-amber-400"}`}
                          aria-hidden="true"
                        />
                        {post.published ? text.published : text.draft}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-dark-300">
                      {post.views ?? post.view_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-300">
                      {formatAdminDate(post.updated_at, dateLocale)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenTranslationManager(post)}
                          className="rounded border border-primary-400/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-600 transition hover:bg-primary-400/10 dark:text-primary-400"
                        >
                          {text.blogTranslations}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditPost(post)}
                          className="rounded border border-gray-300 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-gray-700 transition hover:border-primary-400 hover:text-primary-600 dark:border-dark-600 dark:text-dark-200 dark:hover:text-primary-400"
                        >
                          {text.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          disabled={postActionId === post.id}
                          className="rounded border border-red-400/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-red-600 transition hover:bg-red-400/10 disabled:opacity-50 dark:text-red-300"
                        >
                          {postActionId === post.id ? text.deleting : text.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

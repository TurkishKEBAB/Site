import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import type { BlogTranslation, BlogTranslationCreate } from "@/services/types";

import type { AdminLanguage } from "./AdminForms";

export interface BlogFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  readingTime: number;
  published: boolean;
}

export const defaultBlogFormValues: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  readingTime: 0,
  published: false,
};

interface BlogFormProps {
  initialValues: BlogFormValues;
  onSubmit: (values: BlogFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode: "create" | "edit";
  language: AdminLanguage;
}

const blogFormText = {
  en: {
    title: "Title",
    slug: "Slug",
    excerpt: "Excerpt",
    content: "Markdown body",
    coverImage: "Cover image URL",
    tags: "Tags",
    readingTime: "Reading time (minutes)",
    published: "Publish this post",
    cancel: "Cancel",
    saving: "Saving...",
    create: "Create post",
    update: "Save changes",
  },
  tr: {
    title: "Baslik",
    slug: "Slug",
    excerpt: "Ozet",
    content: "Markdown icerik",
    coverImage: "Kapak gorseli URL",
    tags: "Etiketler",
    readingTime: "Okuma suresi (dakika)",
    published: "Bu yaziyi yayinla",
    cancel: "Iptal",
    saving: "Kaydediliyor...",
    create: "Yazi olustur",
    update: "Degisiklikleri kaydet",
  },
} as const;

const adminInputClass =
  "mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-dark-600 dark:bg-dark-900 dark:text-dark-100";

export function BlogForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  mode,
  language,
}: BlogFormProps) {
  const [values, setValues] = useState<BlogFormValues>(initialValues);
  const text = blogFormText[language];

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setValues((previous) => ({
        ...previous,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }

    setValues((previous) => ({
      ...previous,
      [name]: name === "readingTime" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      await onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{text.title}</span>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            required
            className={adminInputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{text.slug}</span>
          <input
            name="slug"
            value={values.slug}
            onChange={handleChange}
            disabled={mode === "edit"}
            className={`${adminInputClass} disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
        <span>{text.excerpt}</span>
        <textarea
          name="excerpt"
          value={values.excerpt}
          onChange={handleChange}
          rows={2}
          className={adminInputClass}
        />
      </label>

      <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
        <span>{text.content}</span>
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          required
          rows={12}
          className={`${adminInputClass} font-mono text-xs`}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5 text-sm text-gray-700 dark:text-dark-200 md:col-span-2">
          <span>{text.coverImage}</span>
          <input
            name="coverImage"
            value={values.coverImage}
            onChange={handleChange}
            type="url"
            className={adminInputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{text.readingTime}</span>
          <input
            name="readingTime"
            value={values.readingTime || ""}
            onChange={handleChange}
            type="number"
            min={0}
            className={adminInputClass}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
        <span>{text.tags}</span>
        <input
          name="tags"
          value={values.tags}
          onChange={handleChange}
          placeholder="fastapi, python, quality"
          className={adminInputClass}
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-dark-200">
        <input
          name="published"
          type="checkbox"
          checked={values.published}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
        />
        <span>{text.published}</span>
      </label>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-dark-600">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {text.cancel}
        </button>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? text.saving : mode === "create" ? text.create : text.update}
        </button>
      </div>
    </form>
  );
}

export type BlogTranslationMap = Partial<Record<"en" | "tr", BlogTranslation>>;

interface BlogTranslationEditorProps {
  translations: BlogTranslationMap;
  onSave: (language: "en" | "tr", values: BlogTranslationCreate) => Promise<void>;
  loading: boolean;
  language: AdminLanguage;
}

export function BlogTranslationEditor({
  translations,
  onSave,
  loading,
  language,
}: BlogTranslationEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<"en" | "tr">("en");
  const [values, setValues] = useState<BlogTranslationCreate>({
    language: "en",
    title: "",
    content: "",
    excerpt: "",
  });
  const [saving, setSaving] = useState(false);
  const isTurkish = language === "tr";

  useEffect(() => {
    const translation = translations[activeLanguage];
    setValues({
      language: activeLanguage,
      title: translation?.title || "",
      content: translation?.content || "",
      excerpt: translation?.excerpt || "",
    });
  }, [activeLanguage, translations]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || saving) {
      return;
    }
    setSaving(true);
    try {
      await onSave(activeLanguage, values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-gray-200 dark:border-dark-600">
        {(["en", "tr"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setActiveLanguage(code)}
            className={`border-b-2 px-4 py-2 font-mono text-[10px] uppercase tracking-wide ${
              activeLanguage === code
                ? "border-primary-400 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 dark:text-dark-400"
            }`}
          >
            {code === "tr" ? "TR" : "EN"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{isTurkish ? "Baslik" : "Title"}</span>
          <input
            value={values.title}
            onChange={(event) => setValues((previous) => ({ ...previous, title: event.target.value }))}
            required
            className={adminInputClass}
          />
        </label>
        <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{isTurkish ? "Ozet" : "Excerpt"}</span>
          <textarea
            value={values.excerpt || ""}
            onChange={(event) => setValues((previous) => ({ ...previous, excerpt: event.target.value }))}
            rows={2}
            className={adminInputClass}
          />
        </label>
        <label className="block space-y-1.5 text-sm text-gray-700 dark:text-dark-200">
          <span>{isTurkish ? "Markdown icerik" : "Markdown body"}</span>
          <textarea
            value={values.content}
            onChange={(event) => setValues((previous) => ({ ...previous, content: event.target.value }))}
            required
            rows={12}
            className={`${adminInputClass} font-mono text-xs`}
          />
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={loading || saving} className="btn-primary disabled:opacity-50">
            {saving ? (isTurkish ? "Kaydediliyor..." : "Saving...") : isTurkish ? "Ceviriyi kaydet" : "Save translation"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import type { AdminLanguage } from "./AdminForms";

export interface TechnologyFormValues {
  name: string;
  slug: string;
  icon: string;
  category: string;
  color: string;
}

export const defaultTechnologyFormValues: TechnologyFormValues = {
  name: "",
  slug: "",
  icon: "",
  category: "",
  color: "",
};

const FORM_TEXT = {
  en: {
    createTitle: "Add Technology",
    editTitle: "Edit Technology",
    name: "Name",
    slug: "Slug",
    icon: "Icon",
    category: "Category",
    color: "Color",
    cancel: "Cancel",
    saving: "Saving...",
    create: "Create",
    update: "Update",
  },
  tr: {
    createTitle: "Yeni Teknoloji Ekle",
    editTitle: "Teknolojiyi Düzenle",
    name: "Ad",
    slug: "Slug",
    icon: "İkon",
    category: "Kategori",
    color: "Renk",
    cancel: "İptal",
    saving: "Kaydediliyor...",
    create: "Oluştur",
    update: "Güncelle",
  },
} as const;

interface TechnologyFormProps {
  initialValues: TechnologyFormValues;
  onSubmit: (values: TechnologyFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode: "create" | "edit";
  language: AdminLanguage;
}

export function TechnologyForm({ initialValues, onSubmit, onCancel, loading, mode, language }: TechnologyFormProps) {
  const [values, setValues] = useState(initialValues);
  const text = FORM_TEXT[language];

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      await onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {mode === "create" ? text.createTitle : text.editTitle}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {([
          ["name", text.name, "FastAPI"],
          ["slug", text.slug, "fastapi"],
          ["icon", text.icon, "fastapi"],
          ["category", text.category, "Backend"],
          ["color", text.color, "#009688"],
        ] as const).map(([name, label, placeholder]) => (
          <div key={name}>
            <label htmlFor={`technology-${name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {label}{name === "name" || name === "slug" ? <span className="text-red-500"> *</span> : null}
            </label>
            <input
              id={`technology-${name}`}
              name={name}
              value={values[name]}
              onChange={handleChange}
              required={name === "name" || name === "slug"}
              placeholder={placeholder}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {text.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? text.saving : mode === "create" ? text.create : text.update}
        </button>
      </div>
    </form>
  );
}

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { Technology } from '../../services/technologyService';

export type AdminLanguage = 'en' | 'tr';

export interface ProjectImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export interface ProjectTranslationData {
  language: string;
  title: string;
  short_description: string;
  description: string;
}

export interface ProjectFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  githubUrl: string;
  demoUrl: string;
  displayOrder: number;
  featured: boolean;
  technology_ids: string[];
}

export const defaultProjectFormValues: ProjectFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  coverImage: '',
  githubUrl: '',
  demoUrl: '',
  displayOrder: 0,
  featured: false,
  technology_ids: [],
};

export interface SkillFormValues {
  name: string;
  category: string;
  proficiency: number;
  iconUrl: string;
}

export const defaultSkillFormValues: SkillFormValues = {
  name: '',
  category: '',
  proficiency: 50,
  iconUrl: '',
};

export interface ExperienceFormValues {
  title: string;
  organization: string;
  location: string;
  experienceType: 'education' | 'work' | 'volunteer' | 'activity';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export const defaultExperienceFormValues: ExperienceFormValues = {
  title: '',
  organization: '',
  location: '',
  experienceType: 'work',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

const FORM_TEXT = {
  tr: {
    project: {
      title: 'Proje Basligi',
      slug: 'Slug',
      shortDescription: 'Kisa Aciklama',
      coverImage: 'Kapak Gorseli URL',
      description: 'Aciklama',
      githubUrl: 'GitHub URL',
      demoUrl: 'Demo URL',
      displayOrder: 'Gosterim Sirasi',
      featured: 'One cikan proje olarak isaretle',
      technologies: 'Teknolojiler',
      loadingTechnologies: 'Teknolojiler yukleniyor...',
      noTechnology: 'Henuz teknoloji eklenmemis.',
      selectedCountSuffix: 'teknoloji secildi',
      cancel: 'Iptal',
      saving: 'Kaydediliyor...',
      create: 'Projeyi Olustur',
      update: 'Degisiklikleri Kaydet',
    },
    skill: {
      createTitle: 'Yeni Beceri Ekle',
      editTitle: 'Beceri Duzenle',
      name: 'Beceri Adi',
      category: 'Kategori',
      categoryPlaceholder: 'Kategori Secin',
      proficiency: 'Yeterlilik (%)',
      proficiencyLabel: 'Yeterlilik yuzdesi',
      iconUrl: 'Ikon URL',
      cancel: 'Iptal',
      saving: 'Kaydediliyor...',
      create: 'Olustur',
      update: 'Guncelle',
    },
    experience: {
      createTitle: 'Yeni Deneyim Ekle',
      editTitle: 'Deneyim Duzenle',
      title: 'Pozisyon/Unvan',
      organization: 'Kurulus',
      location: 'Konum',
      type: 'Tur',
      startDate: 'Baslangic Tarihi',
      endDate: 'Bitis Tarihi',
      isCurrent: 'Halen devam ediyor',
      description: 'Aciklama',
      descriptionPlaceholder: 'Gorev ve sorumluluklar...',
      cancel: 'Iptal',
      saving: 'Kaydediliyor...',
      create: 'Olustur',
      update: 'Guncelle',
      work: 'Is',
      education: 'Egitim',
      volunteer: 'Gonullu',
      activity: 'Aktivite',
    },
    translation: {
      title: 'Baslik',
      shortDescription: 'Kisa Aciklama',
      description: 'Aciklama',
      saving: 'Kaydediliyor...',
      save: 'Ceviriyi Kaydet',
    },
  },
  en: {
    project: {
      title: 'Project Title',
      slug: 'Slug',
      shortDescription: 'Short Description',
      coverImage: 'Cover Image URL',
      description: 'Description',
      githubUrl: 'GitHub URL',
      demoUrl: 'Demo URL',
      displayOrder: 'Display Order',
      featured: 'Mark as featured project',
      technologies: 'Technologies',
      loadingTechnologies: 'Loading technologies...',
      noTechnology: 'No technologies have been added yet.',
      selectedCountSuffix: 'technologies selected',
      cancel: 'Cancel',
      saving: 'Saving...',
      create: 'Create Project',
      update: 'Save Changes',
    },
    skill: {
      createTitle: 'Add New Skill',
      editTitle: 'Edit Skill',
      name: 'Skill Name',
      category: 'Category',
      categoryPlaceholder: 'Select Category',
      proficiency: 'Proficiency (%)',
      proficiencyLabel: 'Proficiency percentage',
      iconUrl: 'Icon URL',
      cancel: 'Cancel',
      saving: 'Saving...',
      create: 'Create',
      update: 'Update',
    },
    experience: {
      createTitle: 'Add New Experience',
      editTitle: 'Edit Experience',
      title: 'Position/Title',
      organization: 'Organization',
      location: 'Location',
      type: 'Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      isCurrent: 'Currently ongoing',
      description: 'Description',
      descriptionPlaceholder: 'Responsibilities and achievements...',
      cancel: 'Cancel',
      saving: 'Saving...',
      create: 'Create',
      update: 'Update',
      work: 'Work',
      education: 'Education',
      volunteer: 'Volunteer',
      activity: 'Activity',
    },
    translation: {
      title: 'Title',
      shortDescription: 'Short Description',
      description: 'Description',
      saving: 'Saving...',
      save: 'Save Translation',
    },
  },
};

interface ProjectFormProps {
  initialValues: ProjectFormValues;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode: 'create' | 'edit';
  technologies: Technology[];
  loadingTechnologies: boolean;
  language: AdminLanguage;
}

export function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  mode,
  technologies,
  loadingTechnologies,
  language,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const text = FORM_TEXT[language].project;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setValues((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'displayOrder') {
      setValues((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTechnologyToggle = (techId: string) => {
    setValues((prev) => {
      const isSelected = prev.technology_ids.includes(techId);
      return {
        ...prev,
        technology_ids: isSelected
          ? prev.technology_ids.filter((id) => id !== techId)
          : [...prev.technology_ids, techId],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.title}</label>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Portfolio project"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.slug}</label>
          <input
            name="slug"
            value={values.slug}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="new-portfolio-project"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.shortDescription}</label>
          <textarea
            name="shortDescription"
            value={values.shortDescription}
            onChange={handleChange}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.coverImage}</label>
          <input
            name="coverImage"
            value={values.coverImage}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.description}</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.githubUrl}</label>
          <input
            name="githubUrl"
            value={values.githubUrl}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.demoUrl}</label>
          <input
            name="demoUrl"
            value={values.demoUrl}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="https://demo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.displayOrder}</label>
          <input
            type="number"
            name="displayOrder"
            value={values.displayOrder}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="featured"
          type="checkbox"
          name="featured"
          checked={values.featured}
          onChange={handleChange}
          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {text.featured}
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{text.technologies}</label>
        <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800 md:grid-cols-4">
          {loadingTechnologies ? (
            <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">{text.loadingTechnologies}</p>
          ) : technologies.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">{text.noTechnology}</p>
          ) : (
            technologies.map((tech) => (
              <div key={tech.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`tech-${tech.id}`}
                  checked={values.technology_ids.includes(tech.id)}
                  onChange={() => handleTechnologyToggle(tech.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={`tech-${tech.id}`} className="cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                  {tech.name}
                </label>
              </div>
            ))
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {values.technology_ids.length} {text.selectedCountSuffix}
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={loading}
        >
          {text.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? text.saving : mode === 'create' ? text.create : text.update}
        </button>
      </div>
    </form>
  );
}

interface SkillFormProps {
  initialValues: SkillFormValues;
  onSubmit: (values: SkillFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode: 'create' | 'edit';
  language: AdminLanguage;
}

export function SkillForm({ initialValues, onSubmit, onCancel, loading, mode, language }: SkillFormProps) {
  const [values, setValues] = useState<SkillFormValues>(initialValues);
  const text = FORM_TEXT[language].skill;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === 'proficiency') {
      setValues((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? text.createTitle : text.editTitle}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.name} <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Python"
          />
        </div>

        <div>
          <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.category} <span className="text-red-500">*</span>
          </label>
          <select
            id="skill-category"
            name="category"
            value={values.category}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">{text.categoryPlaceholder}</option>
            <option value="Backend">Backend</option>
            <option value="Frontend">Frontend</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
            <option value="Tools">Tools</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="skill-proficiency" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.proficiency} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              id="skill-proficiency"
              type="range"
              name="proficiency"
              min="0"
              max="100"
              step="5"
              value={values.proficiency}
              onChange={handleChange}
              className="flex-1"
              aria-label={text.proficiencyLabel}
            />
            <span className="w-12 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {values.proficiency}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{text.iconUrl}</label>
          <input
            name="iconUrl"
            value={values.iconUrl}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="https://cdn.example.com/icon.svg"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={loading}
        >
          {text.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? text.saving : mode === 'create' ? text.create : text.update}
        </button>
      </div>
    </form>
  );
}

interface ExperienceFormProps {
  initialValues: ExperienceFormValues;
  onSubmit: (values: ExperienceFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode: 'create' | 'edit';
  language: AdminLanguage;
}

export function ExperienceForm({ initialValues, onSubmit, onCancel, loading, mode, language }: ExperienceFormProps) {
  const [values, setValues] = useState<ExperienceFormValues>(initialValues);
  const text = FORM_TEXT[language].experience;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setValues((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? text.createTitle : text.editTitle}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="exp-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.title} <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-title"
              name="title"
              value={values.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Senior Developer"
            />
          </div>

          <div>
            <label htmlFor="exp-organization" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.organization} <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-organization"
              name="organization"
              value={values.organization}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="ABC Tech"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="exp-location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.location}
            </label>
            <input
              id="exp-location"
              name="location"
              value={values.location}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Istanbul, Turkey"
            />
          </div>

          <div>
            <label htmlFor="exp-type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.type} <span className="text-red-500">*</span>
            </label>
            <select
              id="exp-type"
              name="experienceType"
              value={values.experienceType}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="work">{text.work}</option>
              <option value="education">{text.education}</option>
              <option value="volunteer">{text.volunteer}</option>
              <option value="activity">{text.activity}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="exp-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.startDate} <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-start-date"
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="exp-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.endDate}
            </label>
            <input
              id="exp-end-date"
              type="date"
              name="endDate"
              value={values.endDate}
              onChange={handleChange}
              disabled={values.isCurrent}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="exp-is-current"
            type="checkbox"
            name="isCurrent"
            checked={values.isCurrent}
            onChange={handleChange}
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="exp-is-current" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.isCurrent}
          </label>
        </div>

        <div>
          <label htmlFor="exp-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.description}
          </label>
          <textarea
            id="exp-description"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder={text.descriptionPlaceholder}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={loading}
        >
          {text.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? text.saving : mode === 'create' ? text.create : text.update}
        </button>
      </div>
    </form>
  );
}

interface TranslationEditorProps {
  translations: Record<string, ProjectTranslationData>;
  onSave: (language: string, data: Omit<ProjectTranslationData, 'language'>) => Promise<void>;
  loading: boolean;
  language: AdminLanguage;
}

export function TranslationEditor({ translations, onSave, loading, language }: TranslationEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<string>('en');
  const [formData, setFormData] = useState<Omit<ProjectTranslationData, 'language'>>({
    title: '',
    short_description: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const text = FORM_TEXT[language].translation;

  const languages = [
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'tr', name: 'Turkce', flag: 'TR' },
  ];

  useEffect(() => {
    const translation = translations[activeLanguage];
    if (translation) {
      setFormData({
        title: translation.title || '',
        short_description: translation.short_description || '',
        description: translation.description || '',
      });
    } else {
      setFormData({
        title: '',
        short_description: '',
        description: '',
      });
    }
  }, [activeLanguage, translations]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(activeLanguage, formData);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLanguage(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
              activeLanguage === lang.code
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {translations[lang.code] && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300">
                OK
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{text.title}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder={`(${activeLanguage.toUpperCase()})`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{text.shortDescription}</label>
          <textarea
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder={`(${activeLanguage.toUpperCase()})`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{text.description}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={8}
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder={`(${activeLanguage.toUpperCase()})`}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? text.saving : `${activeLanguage.toUpperCase()} ${text.save}`}
          </button>
        </div>
      </form>
    </div>
  );
}

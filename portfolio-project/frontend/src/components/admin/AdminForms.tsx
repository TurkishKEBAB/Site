import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { Technology } from '../../services/technologyService';
import type { ProjectTranslation, SkillDomain, SkillRing } from '../../services/types';

export type AdminLanguage = 'en' | 'tr';
export type { ProjectImage } from '../../services/types';
export type ProjectTranslationData = ProjectTranslation;

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
  nameTr: string;
  sameName: boolean;
  category: string;
  domain: SkillDomain;
  ring: SkillRing;
  iconUrl: string;
}

export const SKILL_DOMAINS: SkillDomain[] = ['backend', 'cloud', 'product', 'testing', 'research'];
export const SKILL_RINGS: SkillRing[] = ['adopt', 'trial', 'assess', 'hold'];

export interface SkillCategoryOption {
  value: string;
  en: string;
  tr: string;
}

export const SKILL_CATEGORIES: SkillCategoryOption[] = [
  { value: 'AI & Data', en: 'AI & Data', tr: 'Yapay Zeka ve Veri' },
  { value: 'Architecture', en: 'Architecture', tr: 'Mimari' },
  { value: 'Backend', en: 'Backend', tr: 'Backend' },
  { value: 'Cloud & DevOps', en: 'Cloud & DevOps', tr: 'Bulut ve DevOps' },
  { value: 'Frontend', en: 'Frontend', tr: 'Frontend' },
  { value: 'Languages', en: 'Languages', tr: 'Diller' },
  { value: 'Observability & Infra', en: 'Observability & Infra', tr: 'Gözlemlenebilirlik ve Altyapı' },
  { value: 'Testing & Automation', en: 'Testing & Automation', tr: 'Test ve Otomasyon' },
  { value: 'Tooling', en: 'Tooling', tr: 'Araçlar' },
];

export const defaultSkillFormValues: SkillFormValues = {
  name: '',
  nameTr: '',
  sameName: false,
  category: '',
  domain: 'backend',
  ring: 'assess',
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
      title: 'Proje Başlığı',
      slug: 'Slug',
      shortDescription: 'Kısa Açıklama',
      coverImage: 'Kapak Görseli URL',
      description: 'Açıklama',
      githubUrl: 'GitHub URL',
      demoUrl: 'Demo URL',
      displayOrder: 'Gösterim Sırası',
      featured: 'Öne çıkan proje olarak işaretle',
      technologies: 'Teknolojiler',
      loadingTechnologies: 'Teknolojiler yükleniyor...',
      noTechnology: 'Henüz teknoloji eklenmemiş.',
      selectedCountSuffix: 'teknoloji seçildi',
      cancel: 'İptal',
      saving: 'Kaydediliyor...',
      create: 'Projeyi Oluştur',
      update: 'Değişiklikleri Kaydet',
    },
    skill: {
      createTitle: 'Yeni Beceri Ekle',
      editTitle: 'Beceri Düzenle',
      nameEn: 'İngilizce Beceri Adı',
      nameTr: 'Türkçe Beceri Adı',
      sameName: 'Türkçe ve İngilizce adları aynı',
      category: 'Kategori',
      categoryPlaceholder: 'Kategori Seçin',
      domain: 'Alan (Matris grubu)',
      ring: 'Radar halkası',
      iconUrl: 'İkon URL',
      cancel: 'İptal',
      saving: 'Kaydediliyor...',
      create: 'Oluştur',
      update: 'Güncelle',
    },
    experience: {
      createTitle: 'Yeni Deneyim Ekle',
      editTitle: 'Deneyim Düzenle',
      title: 'Pozisyon/Unvan',
      organization: 'Kuruluş',
      location: 'Konum',
      type: 'Tür',
      startDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      isCurrent: 'Halen devam ediyor',
      description: 'Açıklama',
      descriptionPlaceholder: 'Görev ve sorumluluklar...',
      cancel: 'İptal',
      saving: 'Kaydediliyor...',
      create: 'Oluştur',
      update: 'Güncelle',
      work: 'İş',
      education: 'Eğitim',
      volunteer: 'Gönüllü',
      activity: 'Etkinlik',
    },
    translation: {
      title: 'Başlık',
      shortDescription: 'Kısa Açıklama',
      description: 'Açıklama',
      saving: 'Kaydediliyor...',
      save: 'Çeviriyi Kaydet',
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
      nameEn: 'English Name',
      nameTr: 'Turkish Name',
      sameName: 'Turkish and English names are the same',
      category: 'Category',
      categoryPlaceholder: 'Select Category',
      domain: 'Domain (Matrix group)',
      ring: 'Radar ring',
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

    if (name === 'sameName' && event.target instanceof HTMLInputElement) {
      const sameName = event.target.checked;
      setValues((prev) => ({
        ...prev,
        sameName,
        nameTr: sameName ? prev.name : prev.nameTr,
      }));
      return;
    }

    if (name === 'name') {
      setValues((prev) => ({
        ...prev,
        name: value,
        nameTr: prev.sameName ? value : prev.nameTr,
      }));
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="skill-name-en" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.nameEn} <span className="text-red-500">*</span>
            </label>
            <input
              id="skill-name-en"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Python"
            />
          </div>
          <div>
            <label htmlFor="skill-name-tr" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.nameTr} <span className="text-red-500">*</span>
            </label>
            <input
              id="skill-name-tr"
              name="nameTr"
              value={values.nameTr}
              onChange={handleChange}
              required
              readOnly={values.sameName}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-800"
              placeholder="Python"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="skill-same-name"
            type="checkbox"
            name="sameName"
            checked={values.sameName}
            onChange={handleChange}
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="skill-same-name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {text.sameName}
          </label>
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
            {SKILL_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.en} / {option.tr}
              </option>
            ))}
            {values.category && !SKILL_CATEGORIES.some((option) => option.value === values.category) && (
              <option value={values.category}>{values.category}</option>
            )}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="skill-domain" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.domain} <span className="text-red-500">*</span>
            </label>
            <select
              id="skill-domain"
              name="domain"
              value={values.domain}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              {SKILL_DOMAINS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="skill-ring" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {text.ring} <span className="text-red-500">*</span>
            </label>
            <select
              id="skill-ring"
              name="ring"
              value={values.ring}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              {SKILL_RINGS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
    { code: 'tr', name: 'Türkçe', flag: 'TR' },
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

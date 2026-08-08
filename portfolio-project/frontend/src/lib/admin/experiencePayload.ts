import type { ExperienceCreate, ExperienceTranslationCreate } from '../../services/types';

export type ExperienceAdminLanguage = 'en' | 'tr';

export interface ExperiencePayloadValues {
  title: string;
  organization: string;
  location: string;
  experienceType: ExperienceCreate['experience_type'];
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

function buildTranslation(
  values: ExperiencePayloadValues,
  language: ExperienceAdminLanguage,
): ExperienceTranslationCreate {
  return {
    language,
    title: values.title.trim(),
    organization: values.organization.trim(),
    location: values.location.trim() || undefined,
    description: values.description.trim() || undefined,
  };
}

function buildCorePayload(values: ExperiencePayloadValues): Pick<
  ExperienceCreate,
  'experience_type' | 'start_date' | 'end_date' | 'is_current'
> {
  return {
    experience_type: values.experienceType,
    start_date: values.startDate,
    end_date: values.isCurrent ? undefined : (values.endDate || undefined),
    is_current: values.isCurrent,
  };
}

export function buildExperienceCreatePayload(
  values: ExperiencePayloadValues,
  language: ExperienceAdminLanguage,
): ExperienceCreate {
  const translation = buildTranslation(values, language);

  return {
    title: translation.title,
    organization: translation.organization,
    location: translation.location,
    ...buildCorePayload(values),
    description: translation.description,
    translations: [translation],
  };
}

export function buildExperienceUpdatePayload(
  values: ExperiencePayloadValues,
  language: ExperienceAdminLanguage,
): Partial<ExperienceCreate> {
  const translation = buildTranslation(values, language);

  return {
    ...buildCorePayload(values),
    translations: [translation],
    ...(language === 'en'
      ? {
          title: translation.title,
          organization: translation.organization,
          location: translation.location,
          description: translation.description,
        }
      : {}),
  };
}

import type { ProjectFormValues } from "@/components/admin/AdminForms";

const optionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function buildProjectPayload(values: ProjectFormValues, includeSlug: boolean) {
  return {
    ...(includeSlug ? { slug: optionalValue(values.slug) } : {}),
    title: values.title.trim(),
    short_description: optionalValue(values.shortDescription),
    description: values.description.trim(),
    cover_image: optionalValue(values.coverImage),
    github_url: optionalValue(values.githubUrl),
    demo_url: optionalValue(values.demoUrl),
    featured: values.featured,
    display_order: values.displayOrder,
    technology_ids: values.technology_ids,
  };
}

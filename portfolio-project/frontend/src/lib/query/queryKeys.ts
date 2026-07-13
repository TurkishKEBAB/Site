type QueryParamValue = boolean | number | string;
type QueryParams = Record<string, QueryParamValue | undefined>;

const isDefinedParam = (
  entry: [string, QueryParamValue | undefined],
): entry is [string, QueryParamValue] => entry[1] !== undefined;

const compactParams = (params?: QueryParams) =>
  Object.fromEntries(
    Object.entries(params ?? {})
      .filter(isDefinedParam)
      .sort(([left], [right]) => left.localeCompare(right)),
  );

export const queryKeys = {
  all: ["api"] as const,
  projects: {
    all: () => [...queryKeys.all, "projects"] as const,
    list: (params?: QueryParams) =>
      [...queryKeys.projects.all(), "list", compactParams(params)] as const,
  },
  dossiers: {
    all: () => [...queryKeys.all, "dossiers"] as const,
    detail: (slug: string, language?: string) =>
      [...queryKeys.dossiers.all(), "detail", slug, language ?? "en"] as const,
  },
  blog: {
    all: () => [...queryKeys.all, "blog"] as const,
    list: (params?: QueryParams) =>
      [...queryKeys.blog.all(), "list", compactParams(params)] as const,
  },
  skills: {
    all: () => [...queryKeys.all, "skills"] as const,
    list: (params?: QueryParams) =>
      [...queryKeys.skills.all(), "list", compactParams(params)] as const,
  },
  experiences: {
    all: () => [...queryKeys.all, "experiences"] as const,
    list: (params?: QueryParams) =>
      [...queryKeys.experiences.all(), "list", compactParams(params)] as const,
  },
};

import { describe, expect, it } from "vitest";

import {
  buildExperienceCreatePayload,
  buildExperienceUpdatePayload,
} from "./experiencePayload";

const values = {
  title: "Yazılım Mühendisliği Stajyeri",
  organization: "NETAŞ",
  location: "İstanbul, Türkiye",
  experienceType: "work" as const,
  startDate: "2025-06-01",
  endDate: "2025-07-31",
  isCurrent: false,
  description: "Türkçe deneyim açıklaması",
};

describe("experience admin payloads", () => {
  it("creates the base record and its active-language translation", () => {
    expect(buildExperienceCreatePayload(values, "tr")).toMatchObject({
      title: values.title,
      organization: values.organization,
      translations: [
        {
          language: "tr",
          title: values.title,
          organization: values.organization,
          location: values.location,
          description: values.description,
        },
      ],
    });
  });

  it("updates a Turkish translation without overwriting the English base fields", () => {
    const payload = buildExperienceUpdatePayload(values, "tr");

    expect(payload).not.toHaveProperty("title");
    expect(payload).not.toHaveProperty("organization");
    expect(payload).not.toHaveProperty("description");
    expect(payload.translations).toEqual([
      {
        language: "tr",
        title: values.title,
        organization: values.organization,
        location: values.location,
        description: values.description,
      },
    ]);
  });
});

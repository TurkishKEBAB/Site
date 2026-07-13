import type { CapabilityGroup } from "@/components/nexus/CapabilityMatrix";
import { getLocaleValue, skillGroups, type Locale } from "@/content/site";
import type { Skill, SkillDomain, SkillRing } from "@/services/types";

const DOMAIN_ORDER: SkillDomain[] = ["backend", "cloud", "product", "testing", "research"];

export type RadarQuadrant = 0 | 1 | 2 | 3;

export interface RadarBlip {
  name: string;
  ring: SkillRing;
  quadrant: RadarQuadrant;
}

const categoryToQuadrant = (category: string): RadarQuadrant => {
  const normalized = category.toLowerCase();

  if (normalized.includes("language") || normalized.includes("programming")) {
    return 0;
  }

  if (["cloud", "devops", "frontend", "database", "platform"].some((term) => normalized.includes(term))) {
    return 1;
  }

  if (normalized.includes("tool")) {
    return 2;
  }

  return 3;
};

const compareSkills = (left: Skill, right: Skill) =>
  left.display_order - right.display_order || left.name.localeCompare(right.name);

export function toCapabilityGroups(skills: Skill[], locale: Locale): CapabilityGroup[] {
  return DOMAIN_ORDER.map((domain, index) => {
    const metadata = skillGroups[index];
    const names = skills
      .filter((skill) => skill.domain === domain)
      .sort(compareSkills)
      .map((skill) => skill.name);

    return {
      no: `/0${index + 1}`,
      domain,
      title: getLocaleValue(metadata.title, locale),
      summary: getLocaleValue(metadata.summary, locale),
      skills: names,
    };
  });
}

export function toRadarBlips(skills: Skill[]): RadarBlip[] {
  return [...skills].sort(compareSkills).map((skill) => ({
    name: skill.name,
    ring: skill.ring,
    quadrant: categoryToQuadrant(skill.category),
  }));
}

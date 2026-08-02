import { describe, expect, it } from "vitest";

import { homeContent, projectRecords, uiDictionary } from "./site";

describe("localized site content", () => {
  it("keeps Turkish public copy free of untranslated prose", () => {
    const isikschedule = projectRecords.find((project) => project.slug === "isikschedule-platform");
    const portfolio = projectRecords.find((project) => project.slug === "portfolio-platform-web-desktop");

    expect(homeContent.tr.heroDescription).toContain("kurumsal arka uç sistemleri");
    expect(homeContent.tr.heroDescription).not.toMatch(/enterprise|production|timezone|regression|ticket/i);
    expect(homeContent.tr.roleParts).toEqual(["KURUMSAL ARKA UÇ", "BULUT VE DEVOPS", "KALİTE OTOMASYONU"]);
    expect(portfolio?.description.tr).toContain("rota işleyicisi");
    expect(isikschedule?.description.tr).not.toMatch(/solver|registry|route handler|coverage/i);
    expect(portfolio?.description.tr).toContain("ön yüzü");
    expect(uiDictionary.tr.blogUnavailableBody).not.toMatch(/Public site|API bağımlı/i);
  });
});

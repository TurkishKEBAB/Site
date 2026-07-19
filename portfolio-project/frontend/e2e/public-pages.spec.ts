import { expect, test } from "@playwright/test";

const publicPages = ["/", "/about", "/projects", "/blog", "/contact"];

for (const route of publicPages) {
  test(`renders public page ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });

    expect(response).not.toBeNull();
    if (!response) {
      throw new Error(`No response received for ${route}`);
    }

    expect(response.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Continue with SAML SSO");
  });
}

test("publishes public crawler metadata", async ({ request }) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain("Sitemap:");

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  expect(await sitemapResponse.text()).toContain("/projects");
});

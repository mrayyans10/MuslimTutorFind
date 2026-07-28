import { test, expect } from "@playwright/test";

test.describe("Community Tutors smoke", () => {
  test("home page shows product brand and secular notice path", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Community Tutors/i).first()).toBeVisible();
  });

  test("find tutors page loads", async ({ page }) => {
    await page.goto("/find-tutors");
    await expect(page.getByRole("heading", { name: /find tutors|tutors/i }).first()).toBeVisible();
  });

  test("find your tutor questionnaire starts", async ({ page }) => {
    await page.goto("/find-your-tutor");
    await expect(page.getByText(/who needs tutoring|find your tutor/i).first()).toBeVisible();
  });

  test("sign-in and sign-up pages render", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await page.goto("/sign-up");
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });

  test("community guidelines mention secular restriction", async ({ page }) => {
    await page.goto("/community-guidelines");
    await expect(page.getByText(/secular|religious instruction/i).first()).toBeVisible();
  });

  test("legal pages show draft notice", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page.getByText(/Draft template/i).first()).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home.page";
import { testConfig } from "./fixtures/test-data";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display main CTA buttons - simple version", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");

    // Check if "Start for free" button is visible
    const startFreeButton = page.locator('a[href="/register"]');
    await expect(startFreeButton).toBeVisible({ timeout: 10000 });

    // Check if "Login" button is visible
    const loginButton = page.locator('a[href="/login"]');
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    // Check button text content
    await expect(startFreeButton).toContainText("Rozpocznij za darmo");
    await expect(loginButton).toContainText("Zaloguj się");
  });

  test("should load home page successfully", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigateToHome();
    expect(await homePage.isHomePageLoaded()).toBe(true);
  });

  test("should display main CTA buttons", async ({ page }) => {
    // Check if "Start for free" button is visible
    const startFreeButton = page.locator('a[href="/register"]', { hasText: "Rozpocznij za darmo" });
    await expect(startFreeButton).toBeVisible();

    // Check if "Login" button is visible
    const loginButton = page.locator('a[href="/login"]', { hasText: "Zaloguj się" });
    await expect(loginButton).toBeVisible();
  });

  test("should take screenshot on failure", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigateToHome();
    expect(await homePage.isHomePageLoaded()).toBe(true);
  });

  test("should respect timeout settings", async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step("Load page with custom timeout", async () => {
      await page.goto("/", { timeout: testConfig.longTimeout });
      await homePage.waitForPageLoad();
    });

    expect(await homePage.isHomePageLoaded()).toBe(true);
  });
});

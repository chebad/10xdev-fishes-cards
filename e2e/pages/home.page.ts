import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  // Locators
  readonly heading: Locator;
  readonly navigationMenu: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.heading = page.locator("h1").first();
    this.navigationMenu = page.locator("nav");
    this.themeToggle = page.locator('[data-testid="theme-toggle"]');
  }

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.goto("/");
    await this.waitForPageLoad();
  }

  /**
   * Check if home page is loaded
   */
  async isHomePageLoaded(): Promise<boolean> {
    return await this.isVisible(this.heading);
  }

  /**
   * Toggle page theme
   */
  async toggleTheme() {
    if (await this.isVisible(this.themeToggle)) {
      await this.clickElement(this.themeToggle);
    }
  }

  /**
   * Get home page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getElementText(this.heading);
  }

  /**
   * Check if navigation is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    return await this.isVisible(this.navigationMenu);
  }
}

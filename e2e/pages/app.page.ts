import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class AppPage extends BasePage {
  // Locators
  readonly userGreeting: Locator;
  readonly logoutButton: Locator;
  readonly dashboardContent: Locator;
  readonly navigationMenu: Locator;
  readonly appTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.userGreeting = page.locator("text=/Cześć.*@/");
    this.logoutButton = page.locator("button", { hasText: "Wyloguj" });
    this.dashboardContent = page.locator('[data-testid="dashboard-content"], main');
    this.navigationMenu = page.locator("nav, header");
    this.appTitle = page.locator("h1, h2, a").filter({ hasText: "FishCards" }).first();
  }

  /**
   * Navigate to app page
   */
  async navigateToApp() {
    await this.goto("/app");
    await this.waitForPageLoad();
  }

  /**
   * Check if app page is loaded (user is authenticated)
   */
  async isAppPageLoaded(): Promise<boolean> {
    // Check for any indicator that user is logged in
    const hasLogoutButton = await this.isVisible(this.logoutButton);
    const hasAppTitle = await this.isVisible(this.appTitle);
    return hasLogoutButton || hasAppTitle;
  }

  /**
   * Check if user is logged in by looking for user-specific elements
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.logoutButton);
  }

  /**
   * Get user email from greeting text
   */
  async getUserEmail(): Promise<string | null> {
    if (await this.isVisible(this.userGreeting)) {
      const greetingText = await this.getElementText(this.userGreeting);
      const emailMatch = greetingText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return emailMatch ? emailMatch[1] : null;
    }
    return null;
  }

  /**
   * Logout user
   */
  async logout() {
    if (await this.isVisible(this.logoutButton)) {
      await this.clickElement(this.logoutButton);
    }
  }

  /**
   * Wait for redirect after login
   */
  async waitForLoginRedirect() {
    // Wait for URL to change to /app or for logout button to appear
    await Promise.race([this.page.waitForURL("**/app"), this.waitForElement(this.logoutButton, { timeout: 10000 })]);
  }
}

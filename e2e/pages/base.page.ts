import type { Page, Locator } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path = "") {
    await this.page.goto(path);
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Click element with optional waiting
   */
  async clickElement(locator: Locator, options?: { timeout?: number }) {
    await locator.click(options);
  }

  /**
   * Fill text input
   */
  async fillInput(locator: Locator, text: string) {
    await locator.fill(text);
  }

  /**
   * Get text from element
   */
  async getElementText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  /**
   * Wait for element
   */
  async waitForElement(locator: Locator, options?: { timeout?: number }) {
    await locator.waitFor(options);
  }

  /**
   * Take screenshot of the page
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}

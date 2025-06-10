import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly registerLink: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators - prioritize data-testid for reliability
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit");

    this.errorMessage = page.locator('[role="alert"]');
    this.loadingSpinner = page.locator(".animate-spin");
    this.registerLink = page.locator('a[href="/register"]').filter({ hasText: "Zarejestruj się" });
    this.pageTitle = page.locator("text=Logowanie").first();
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto("/login");
    await this.waitForPageLoad();
  }

  /**
   * Check if login page is loaded
   */
  async isLoginPageLoaded(): Promise<boolean> {
    return await this.isVisible(this.pageTitle);
  }

  /**
   * Fill login form with email and password - simple approach
   */
  async fillFormSimple(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill login form with email and password
   */
  async fillLoginForm(email: string, password: string) {
    // Clear fields first
    await this.emailInput.clear();
    await this.passwordInput.clear();

    // Fill with new values
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Trigger blur to activate validation
    await this.emailInput.blur();
    await this.passwordInput.blur();
  }

  /**
   * Fill email input only
   */
  async fillEmail(email: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }

  /**
   * Fill password input only
   */
  async fillPassword(password: string) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
  }

  /**
   * Submit login form
   */
  async submitForm() {
    // Check if button is enabled before clicking
    const isEnabled = !(await this.submitButton.isDisabled());
    if (isEnabled) {
      await this.clickElement(this.submitButton);
    } else {
      throw new Error("Submit button is disabled - form validation failed");
    }
  }

  /**
   * Perform complete login process
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.waitForFormValidation();
    await this.submitForm();
  }

  /**
   * Check if form is in loading state
   */
  async isFormLoading(): Promise<boolean> {
    return await this.isVisible(this.loadingSpinner);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Click register link
   */
  async clickRegisterLink() {
    await this.clickElement(this.registerLink);
  }

  /**
   * Force submit form (for testing validation behavior)
   */
  async forceSubmitForm() {
    await this.submitButton.click({ force: true });
  }

  /**
   * Wait for form to become valid/invalid
   */
  async waitForFormValidation() {
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if email input has value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Check if password input has value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if form fields are visible and interactable
   */
  async areFormFieldsReady(): Promise<boolean> {
    const emailVisible = await this.emailInput.isVisible();
    const passwordVisible = await this.passwordInput.isVisible();
    const emailEnabled = await this.emailInput.isEnabled();
    const passwordEnabled = await this.passwordInput.isEnabled();

    return emailVisible && passwordVisible && emailEnabled && passwordEnabled;
  }
}

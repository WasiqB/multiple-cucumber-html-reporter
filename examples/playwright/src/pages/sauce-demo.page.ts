import type { Locator, Page } from '@playwright/test';

/**
 * Page object for Sauce Demo application.
 * Contains all selectors and action methods for the Sauce Demo pages.
 */
class SauceDemoPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public get usernameInput(): Locator {
    return this.page.locator('id=user-name');
  }

  public get passwordInput(): Locator {
    return this.page.locator('id=password');
  }

  public get loginButton(): Locator {
    return this.page.locator('id=login-button');
  }

  public get errorMessage(): Locator {
    return this.page.locator('css=h3[data-test="error"]');
  }

  public get pageTitle(): Locator {
    return this.page.locator('.title');
  }

  public get cartBadge(): Locator {
    return this.page.locator('css=.shopping_cart_badge');
  }

  public get cartLink(): Locator {
    return this.page.locator('css=.shopping_cart_link');
  }

  public get burgerMenuButton(): Locator {
    return this.page.locator('id=react-burger-menu-btn');
  }

  public get burgerMenuWrapper(): Locator {
    return this.page.locator('css=.bm-menu-wrap');
  }

  public get logoutLink(): Locator {
    return this.page.locator('id=logout_sidebar_link');
  }

  public get checkoutButton(): Locator {
    return this.page.locator('css=[data-test="checkout"]');
  }

  public get cartItems(): Promise<Locator[]> {
    return this.page.locator('css=.cart_item').all();
  }

  public get firstNameInput(): Locator {
    return this.page.locator('css=[data-test="firstName"]');
  }

  public get lastNameInput(): Locator {
    return this.page.locator('css=[data-test="lastName"]');
  }

  public get postalCodeInput(): Locator {
    return this.page.locator('css=[data-test="postalCode"]');
  }

  public get continueButton(): Locator {
    return this.page.locator('css=[data-test="continue"]');
  }

  public get finishButton(): Locator {
    return this.page.locator('css=[data-test="finish"]');
  }

  public get completeHeader(): Locator {
    return this.page.locator('css=.complete-header');
  }

  /**
   * Navigates to the Sauce Demo login page.
   */
  public async open() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /**
   * Fills the login form and submits.
   */
  public async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Finds an inventory item by name and clicks its Add to Cart button.
   */
  public async addProductToCart(productName: string) {
    const items = await this.page.locator('css=.inventory_item').all();
    for (const item of items) {
      const nameEl = item.locator('css=.inventory_item_name');
      const name = await nameEl.textContent();
      if (name === productName) {
        const addBtn = item.locator('button');
        await addBtn.click();
        return;
      }
    }
    throw new Error(`Product "${productName}" not found on the page`);
  }

  /**
   * Fills the checkout information form.
   */
  public async fillCheckoutInfo(firstName: string, lastName: string, zipCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(zipCode);
  }
}

export default SauceDemoPage;

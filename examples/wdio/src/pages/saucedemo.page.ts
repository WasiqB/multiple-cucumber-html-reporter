import { $, $$, browser } from '@wdio/globals';

/**
 * Page object for Sauce Demo application.
 * Contains all selectors and action methods for the Sauce Demo pages.
 */
class SauceDemoPage {
  public get usernameInput(): ChainablePromiseElement {
    return $('[data-test="username"]');
  }

  public get passwordInput(): ChainablePromiseElement {
    return $('[data-test="password"]');
  }

  public get loginButton(): ChainablePromiseElement {
    return $('[data-test="login-button"]');
  }

  public get errorMessage(): ChainablePromiseElement {
    return $('[data-test="error"]');
  }

  public get pageTitle(): ChainablePromiseElement {
    return $('.title');
  }

  public get cartBadge(): ChainablePromiseElement {
    return $('.shopping_cart_badge');
  }

  public get cartLink(): ChainablePromiseElement {
    return $('.shopping_cart_link');
  }

  public get burgerMenuButton(): ChainablePromiseElement {
    return $('#react-burger-menu-btn');
  }

  public get burgerMenuWrapper(): ChainablePromiseElement {
    return $('.bm-menu-wrap');
  }

  public get logoutLink(): ChainablePromiseElement {
    return $('[data-test="logout-sidebar-link"]');
  }

  public get checkoutButton(): ChainablePromiseElement {
    return $('[data-test="checkout"]');
  }

  public get cartItems(): ChainablePromiseArray {
    return $$('.cart_item');
  }

  public get firstNameInput(): ChainablePromiseElement {
    return $('[data-test="firstName"]');
  }

  public get lastNameInput(): ChainablePromiseElement {
    return $('[data-test="lastName"]');
  }

  public get postalCodeInput(): ChainablePromiseElement {
    return $('[data-test="postalCode"]');
  }

  public get continueButton(): ChainablePromiseElement {
    return $('[data-test="continue"]');
  }

  public get finishButton(): ChainablePromiseElement {
    return $('[data-test="finish"]');
  }

  public get completeHeader(): ChainablePromiseElement {
    return $('.complete-header');
  }

  /**
   * Navigates to the Sauce Demo login page.
   */
  public async open() {
    await browser.url('https://www.saucedemo.com/');
  }

  /**
   * Fills the login form and submits.
   */
  public async login(username: string, password: string) {
    await this.usernameInput.clearValue();
    await this.usernameInput.setValue(username);
    await this.passwordInput.clearValue();
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }

  /**
   * Finds an inventory item by name and clicks its Add to Cart button.
   */
  public async addProductToCart(productName: string) {
    const items = await $$('.inventory_item');
    for (const item of items) {
      const nameEl = item.$('.inventory_item_name');
      const name = await nameEl.getText();
      if (name === productName) {
        const addBtn = item.$('button');
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
    await this.firstNameInput.setValue(firstName);
    await this.lastNameInput.setValue(lastName);
    await this.postalCodeInput.setValue(zipCode);
  }
}

export default new SauceDemoPage();

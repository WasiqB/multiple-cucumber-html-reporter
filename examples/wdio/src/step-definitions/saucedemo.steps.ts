import { type DataTable, Given, Then, When } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import SauceDemoPage from '@/pageobjects/saucedemo.page.js';

Given('I am on the Sauce Demo login page', async () => {
  await SauceDemoPage.open();
});

When('I enter username {string} and password {string}', async (username: string, password: string) => {
  await SauceDemoPage.usernameInput.clearValue();
  await SauceDemoPage.usernameInput.setValue(username);
  await SauceDemoPage.passwordInput.clearValue();
  await SauceDemoPage.passwordInput.setValue(password);
});

When('I click the login button', async () => {
  await SauceDemoPage.loginButton.click();
});

Then('I should see the login result as {string} with message {string}', async (result: string, message: string) => {
  if (result === 'success') {
    await expect(SauceDemoPage.pageTitle).toBeDisplayed();
    await expect(SauceDemoPage.pageTitle).toHaveText(expect.stringContaining(message));
  } else {
    await expect(SauceDemoPage.errorMessage).toBeDisplayed();
    await expect(SauceDemoPage.errorMessage).toHaveText(expect.stringContaining(message));
  }
});

When('I add {string} to the cart', async (productName: string) => {
  await SauceDemoPage.addProductToCart(productName);
});

Then('the cart badge count should be {string}', async (expectedCount: string) => {
  await expect(SauceDemoPage.cartBadge).toBeDisplayed();
  await expect(SauceDemoPage.cartBadge).toHaveText(expectedCount);
});

When('I click on the shopping cart', async () => {
  await SauceDemoPage.cartLink.click();
});

Then('I should see {string} in the cart', async (productName: string) => {
  const cartItems = SauceDemoPage.cartItems;
  const texts = await cartItems.map(async (element) => await element.getText());
  const found = texts.some((text) => text.includes(productName));
  await expect(found).toBe(true);
});

When('I click the checkout button', async () => {
  await SauceDemoPage.checkoutButton.click();
});

When('I fill checkout information with:', async (dataTable: DataTable) => {
  const data = dataTable.hashes()[0] as Record<string, string>;
  await SauceDemoPage.fillCheckoutInfo(data['First Name'], data['Last Name'], data['Zip Code']);
});

When('I click the continue button', async () => {
  await SauceDemoPage.continueButton.click();
});

Then('I should see the checkout overview for {string}', async (productName: string) => {
  const url = await browser.getUrl();
  expect(url).toContain('/checkout-step-two.html');
  const cartItems = SauceDemoPage.cartItems;
  const texts = await cartItems.map((el) => el.getText());
  const found = texts.some((text) => text.includes(productName));
  await expect(found).toBe(true);
});

When('I click the finish button', async () => {
  await SauceDemoPage.finishButton.click();
});

Then('I should see the success page with message {string}', async (message: string) => {
  const url = await browser.getUrl();
  await expect(url).toContain('/checkout-complete.html');
  await expect(SauceDemoPage.completeHeader).toBeDisplayed();
  await expect(SauceDemoPage.completeHeader).toHaveText(expect.stringContaining(message));
});

When('I open the side menu', async () => {
  await SauceDemoPage.burgerMenuButton.click();
  await SauceDemoPage.burgerMenuWrapper.waitForDisplayed({ timeout: 5000 });
});

When('I click the logout button', async () => {
  await SauceDemoPage.logoutLink.click();
});

Then('I should see the login page', async () => {
  await expect(SauceDemoPage.usernameInput).toBeDisplayed();
});

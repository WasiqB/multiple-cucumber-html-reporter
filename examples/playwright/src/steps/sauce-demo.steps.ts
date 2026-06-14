import { existsSync, readFileSync } from 'node:fs';
import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  type DataTable,
  Given,
  Status,
  setDefaultTimeout,
  Then,
  When,
} from '@cucumber/cucumber';
import { type Browser, type BrowserContext, chromium, expect, type Page, type Video } from '@playwright/test';
import SauceDemoPage from '../pages/sauce-demo.page.js';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let sauceDemoPage: SauceDemoPage;

setDefaultTimeout(30000);

BeforeAll(async () => {
  browser = await chromium.launch({ headless: !!process.env.CI });
});

Before(async () => {
  context = await browser.newContext({
    recordVideo: {
      dir: './test-results/videos',
      size: { width: 640, height: 480 },
      showActions: {
        duration: 500,
      },
    },
  });
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });
  page = await context.newPage();
  sauceDemoPage = new SauceDemoPage(page);
});

AfterAll(async () => {
  await browser?.close();
});

After(async function ({ pickle, result }) {
  const tracePath = `./test-results/trace/${pickle.id}.zip`;
  const screenshotPath = `./test-results/screenshots/${pickle.id}.png`;
  let img: Buffer | undefined;
  let video: Video | null = null;

  if (!page.isClosed()) {
    video = page.video();
    img = await page.screenshot({ path: screenshotPath, type: 'png', fullPage: true });
    this.attach(img, { mediaType: 'image/png', fileName: pickle.name });
  }

  await context.tracing.stop({ path: tracePath });
  await context.close();

  if (result?.status === Status.PASSED) {
    const videoPath = await video?.path();
    if (videoPath && existsSync(videoPath)) {
      this.attach(readFileSync(videoPath), 'video/webm');
    }
    const traceFileLink = `<a href="https://trace.playwright.dev/">Open ${tracePath}</a>`;
    this.attach(`Trace file: ${traceFileLink}`, 'text/html');
  }
});

Given('I am on the Sauce Demo login page', async () => {
  await sauceDemoPage.open();
});

When('I enter username {string} and password {string}', async (username: string, password: string) => {
  await sauceDemoPage.usernameInput.fill(username);
  await sauceDemoPage.passwordInput.fill(password);
});

When('I click the login button', async () => {
  await sauceDemoPage.loginButton.click();
});

Then('I should see the login result as {string} with message {string}', async (result: string, message: string) => {
  if (result === 'success') {
    await expect(sauceDemoPage.pageTitle).toBeVisible();
    await expect(sauceDemoPage.pageTitle).toHaveText(message);
  } else {
    await expect(sauceDemoPage.errorMessage).toBeVisible();
    await expect(sauceDemoPage.errorMessage).toHaveText(message);
  }
});

When('I add {string} to the cart', async (productName: string) => {
  await sauceDemoPage.addProductToCart(productName);
});

Then('the cart badge count should be {string}', async (expectedCount: string) => {
  await expect(sauceDemoPage.cartBadge).toBeVisible();
  await expect(sauceDemoPage.cartBadge).toHaveText(expectedCount);
});

When('I click on the shopping cart', async () => {
  await sauceDemoPage.cartLink.click();
});

Then('I should see {string} in the cart', async (productName: string) => {
  const cartItems = await sauceDemoPage.cartItems;
  const texts = await Promise.all(cartItems.map(async (element) => await element.textContent()));
  const found = texts.some((text) => text?.includes(productName));
  expect(found).toBe(true);
});

When('I click the checkout button', async () => {
  await sauceDemoPage.checkoutButton.click();
});

When('I fill checkout information with:', async (dataTable: DataTable) => {
  const data = dataTable.hashes()[0] as Record<string, string>;
  await sauceDemoPage.fillCheckoutInfo(data['First Name'], data['Last Name'], data['Zip Code']);
});

When('I click the continue button', async () => {
  await sauceDemoPage.continueButton.click();
});

Then('I should see the checkout overview for {string}', async (productName: string) => {
  const url = page.url();
  expect(url).toContain('/checkout-step-two.html');
  const cartItems = await sauceDemoPage.cartItems;
  const texts = await Promise.all(cartItems.map(async (el) => await el.textContent()));
  const found = texts.some((text) => text?.includes(productName));
  expect(found).toBe(true);
});

When('I click the finish button', async () => {
  await sauceDemoPage.finishButton.click();
});

Then('I should see the success page with message {string}', async (message: string) => {
  const url = page.url();
  expect(url).toContain('/checkout-complete.html');
  await expect(sauceDemoPage.completeHeader).toBeVisible();
  await expect(sauceDemoPage.completeHeader).toHaveText(message);
});

When('I open the side menu', async () => {
  await sauceDemoPage.burgerMenuButton.click();
  await sauceDemoPage.burgerMenuWrapper.waitFor({ state: 'visible', timeout: 5000 });
});

When('I click the logout button', async function () {
  this.attach('Logging out of the application');
  await sauceDemoPage.logoutLink.click();
});

Then('I should see the login page', async () => {
  await expect(sauceDemoPage.usernameInput).toBeVisible();
});

Then('Here is a {string} step', async (step: string) => {
  if (step === 'pending') return 'pending';
});

Then('This will be pending', async () => {
  return 'pending';
});

Then(/Here is a "([^"]*)" step/, async (step: string) => {
  console.log(step);
});

When('This will fail', async () => {
  throw new Error('This will fail');
});

Then('This will get skipped', async () => {
  throw new Error('This will get skipped');
});

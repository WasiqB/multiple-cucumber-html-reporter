import {
  After,
  AfterStep,
  attach,
  Before,
  BeforeStep,
  type DataTable,
  Given,
  Then,
  When,
} from '@badeball/cypress-cucumber-preprocessor';

/**
 * Global setup before each scenario tagged with @saucedemo.
 */
Before({ tags: '@saucedemo' }, (scenario) => {
  attach(JSON.stringify(scenario, null, 2), { mediaType: 'application/json', fileName: 'Scenario JSON' });
});

/**
 * Logic before each individual step.
 */
BeforeStep((scenario) => {
  const stepText = scenario.pickleStep.text;
  attach(`Step execution begins: ${stepText}`);
});

/**
 * Logic after each step - Capturing screenshots and logs.
 */
AfterStep((scenario) => {
  const stepText = scenario.pickleStep.text.replace(/\s+/g, '_').substring(0, 30);
  const screenshotName = `${stepText}_${Date.now()}`;

  cy.screenshot(screenshotName, { capture: 'viewport' });
  attach(`Completed step: ${scenario.pickleStep.text}`);
});

/**
 * Global teardown after each scenario.
 */
After((scenario) => {
  attach(`Scenario finished: ${scenario.pickle.name}.`);
});

Given('I am on the Sauce Demo login page', () => {
  attach('Navigating to Sauce Demo login page');
  cy.visit('https://www.saucedemo.com/');
});

When('I enter username {string} and password {string}', (username: string, password: string) => {
  attach(`Entering credentials - Username: ${username}`);
  cy.get('[data-test="username"]').clear();
  if (username) {
    cy.get('[data-test="username"]').type(username);
  }
  cy.get('[data-test="password"]').clear();
  if (password) {
    cy.get('[data-test="password"]').type(password);
  }
});

When('I click the login button', () => {
  attach('Clicking on the login button');
  cy.get('[data-test="login-button"]').click();
});

Then('I should see the login result as {string} with message {string}', (result: string, message: string) => {
  attach(`Verifying login result: ${result}, expected message/title: ${message}`);
  if (result === 'success') {
    cy.get('.title').should('be.visible').and('contain.text', message);
  } else {
    cy.get('[data-test="error"]').should('be.visible').and('contain.text', message);
  }
});

When('I add {string} to the cart', (productName: string) => {
  attach(`Adding "${productName}" to the cart`);
  cy.contains('.inventory_item', productName).find('button').should('be.visible').click();
});

Then('the cart badge count should be {string}', (expectedCount: string) => {
  attach(`Verifying cart badge shows: ${expectedCount}`);
  cy.get('.shopping_cart_badge').should('be.visible').and('have.text', expectedCount);
});

When('I click on the shopping cart', () => {
  attach('Navigating to the shopping cart page');
  cy.get('.shopping_cart_link').click();
});

Then('I should see {string} in the cart', (productName: string) => {
  attach(`Verifying "${productName}" is in the shopping cart`);
  cy.get('.cart_item').should('be.visible').and('contain.text', productName);
});

When('I click the checkout button', () => {
  attach('Clicking the checkout button');
  cy.get('[data-test="checkout"]').click();
});

When('I fill checkout information with:', (dataTable: DataTable) => {
  const data = dataTable.hashes()[0];
  const firstName = data['First Name'];
  const lastName = data['Last Name'];
  const zipCode = data['Zip Code'];

  attach(`Filling checkout details: ${firstName} ${lastName}, Zip: ${zipCode}`);
  cy.get('[data-test="firstName"]').clear().type(firstName);
  cy.get('[data-test="lastName"]').clear().type(lastName);
  cy.get('[data-test="postalCode"]').clear().type(zipCode);
});

When('I click the continue button', () => {
  attach('Clicking the continue button');
  cy.get('[data-test="continue"]').click();
});

Then('I should see the checkout overview for {string}', (productName: string) => {
  attach(`Verifying checkout overview page contains: ${productName}`);
  cy.url().should('include', '/checkout-step-two.html');
  cy.get('.cart_item').should('be.visible').and('contain.text', productName);
});

When('I click the finish button', () => {
  attach('Clicking the finish button');
  cy.get('[data-test="finish"]').click();
});

Then('I should see the success page with message {string}', (message: string) => {
  attach(`Verifying success page message: ${message}`);
  cy.url().should('include', '/checkout-complete.html');
  cy.get('.complete-header').should('be.visible').and('contain.text', message);
});

When('I open the side menu', () => {
  attach('Opening the sidebar menu');
  cy.get('#react-burger-menu-btn').click();
  cy.get('.bm-menu-wrap').should('be.visible');
});

When('I click the logout button', () => {
  attach('Clicking the logout button');
  cy.get('[data-test="logout-sidebar-link"]').click();
});

Then('I should see the login page', () => {
  attach('Verifying user is back on the login page');
  cy.get('[data-test="username"]').should('be.visible');
});

Then('Here is a {string} step', (step: string) => {
  if (step === 'pending') return 'pending';
});

Then(/Here is a "([^"]*)" step/, (step: string) => {
  console.log(step);
});

When('This will fail', () => {
  throw new Error('This will fail');
});

Then('This will be pending', async () => {
  return 'pending';
});

Then('This will get skipped', () => {
  throw new Error('This will get skipped');
});

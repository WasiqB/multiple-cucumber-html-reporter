/// <reference types="cypress" />

import {
  After,
  AfterStep,
  Before,
  BeforeStep,
  type DataTable,
  defineParameterType,
  Given,
  Then,
  When,
} from '@badeball/cypress-cucumber-preprocessor';

// --- Parameter Types ---

/**
 * Custom parameter type for identifying page names within double quotes.
 * Example: I navigate to the "Register" page
 */
defineParameterType({
  name: 'pageName',
  regexp: /"([^"]*)" page/,
  transformer: (s: string) => s,
});

// --- Hooks ---

/**
 * Global setup before each scenario tagged with @parabank.
 */
Before({ tags: '@parabank' }, function (this: any, scenario) {
  this.attach(`Starting scenario: ${scenario.pickle.name}`, 'text/plain');
  cy.log(`Starting scenario: ${scenario.pickle.name}`);
});

/**
 * Logic before each individual step.
 */
BeforeStep(function (this: any, scenario) {
  const stepText = scenario.pickleStep.text;
  this.attach(`Step execution begins: ${stepText}`, 'text/plain');
});

/**
 * Logic after each step - Capturing screenshots and logs.
 */
AfterStep(function (this: any, scenario) {
  const stepText = scenario.pickleStep.text.replace(/\s+/g, '_').substring(0, 30);
  const screenshotName = `${stepText}_${Date.now()}`;

  // Capturing screenshot for every step to satisfy in-depth reporting requirement.
  cy.screenshot(screenshotName, { capture: 'viewport' });

  // Attaching completion log to the Cucumber JSON report.
  this.attach(`Completed step: ${scenario.pickleStep.text}`, 'text/plain');
});

/**
 * Global teardown after each scenario.
 */
After(function (this: any, scenario) {
  // In Cypress/Mocha, we check the state of the current test for failure.
  if (this.currentTest.state === 'failed') {
    this.attach(`SCENARIO FAILED: ${scenario.pickle.name}`, 'text/plain');
    cy.log('Scenario failed! Check screenshots in the report.');
  } else {
    this.attach(`Scenario passed: ${scenario.pickle.name}`, 'text/plain');
    cy.log('Scenario finished successfully.');
  }
});

// --- Step Definitions ---

Given('I am on the Parabank home page', function (this: any) {
  this.attach('Navigating to Parabank index page', 'text/plain');
  cy.visit('https://parabank.parasoft.com/parabank/index.htm');
});

/**
 * Navigates to a specific page using the custom parameter type.
 */
When('I navigate to the {pageName}', function (this: any, pageName: string) {
  this.attach(`Clicking on link for: ${pageName}`, 'text/plain');
  cy.contains('a', pageName).click();
});

/**
 * Fills registration details from a Gherkin DataTable.
 */
When('I fill in my personal details:', function (this: any, dataTable: DataTable) {
  const data = dataTable.hashes()[0];
  this.attach(`Filling registration details for: ${data['First Name']} ${data['Last Name']}`, 'text/plain');

  const fields: Record<string, string> = {
    'First Name': 'customer.firstName',
    'Last Name': 'customer.lastName',
    Address: 'customer.address.street',
    City: 'customer.address.city',
    State: 'customer.address.state',
    'Zip Code': 'customer.address.zipCode',
    Phone: 'customer.phoneNumber',
    SSN: 'customer.ssn',
  };

  Object.entries(fields).forEach(([label, id]) => {
    if (data[label]) {
      cy.get(`input[id="${id}"]`).type(data[label]);
    }
  });
});

When('I choose a username {string} and password {string}', function (this: any, username: string, password: string) {
  this.attach(`Choosing credentials: ${username}`, 'text/plain');
  cy.get('input[id="customer.username"]').type(username);
  cy.get('input[id="customer.password"]').type(password);
  cy.get('input[id="repeatedPassword"]').type(password);
});

When('I click on the {string} button', function (this: any, buttonValue: string) {
  this.attach(`Clicking button with value: ${buttonValue}`, 'text/plain');
  cy.get(`input[type="submit"][value="${buttonValue}"]`).click();
});

Then('I should see a welcome message {string}', function (this: any, message: string) {
  this.attach(`Verifying welcome message: ${message}`, 'text/plain');
  cy.get('h1.title').should('contain', message);
});

Then('I should be logged in', function (this: any) {
  this.attach('Verifying Logout link visibility', 'text/plain');
  cy.contains('a', 'Log Out').should('be.visible');
});

When('I enter my username {string} and password {string}', function (this: any, username: string, password: string) {
  this.attach(`Entering login credentials for: ${username}`, 'text/plain');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
});

Then('I should see the {string} page', function (this: any, title: string) {
  this.attach(`Verifying page title: ${title}`, 'text/plain');
  cy.get('h1.title').should('contain', title);
});

Then('I should not see the {string} error message', function (this: any, errorText: string) {
  this.attach(`Confirming absence of error: ${errorText}`, 'text/plain');
  cy.get('.error').should('not.contain', errorText);
});

Then('I should see an error message {string}', function (this: any, errorText: string) {
  this.attach(`Verifying error message: ${errorText}`, 'text/plain');
  cy.get('.error').should('contain', errorText);
});

Then('I should still be on the home page', function (this: any) {
  this.attach('Verifying URL is on index page', 'text/plain');
  cy.url().should('include', '/index.htm');
});

/**
 * Fills account lookup details from a DataTable.
 */
When('I fill in the lookup form with:', function (this: any, dataTable: DataTable) {
  const data = dataTable.hashes()[0];
  this.attach(`Filling lookup details for: ${data['First Name']} ${data['Last Name']}`, 'text/plain');

  const lookupFields: Record<string, string> = {
    'First Name': 'firstName',
    'Last Name': 'lastName',
    Address: 'address.street',
    City: 'address.city',
    State: 'address.state',
    'Zip Code': 'address.zipCode',
    SSN: 'ssn',
  };

  Object.entries(lookupFields).forEach(([label, id]) => {
    if (data[label]) {
      cy.get(`input[id="${id}"]`).type(data[label]);
    }
  });
});

Then('I should see my login information', function (this: any) {
  this.attach('Verifying success message for lookup', 'text/plain');
  cy.get('p').should('contain', 'Your login information was located successfully');
});

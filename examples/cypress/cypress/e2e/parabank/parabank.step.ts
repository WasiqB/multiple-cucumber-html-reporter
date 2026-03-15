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

/**
 * Custom parameter type for identifying page names within double quotes.
 * Example: I navigate to the "Register" page
 */
defineParameterType({
  name: 'pageName',
  regexp: /"([^"]*)" page/,
  transformer: (s: string) => s,
});

/**
 * Global setup before each scenario tagged with @parabank.
 */
Before({ tags: '@parabank' }, (scenario) => {
  cy.log(`Starting scenario: ${scenario.pickle.name}`);
});

/**
 * Logic before each individual step.
 */
BeforeStep((scenario) => {
  const stepText = scenario.pickleStep.text;
  cy.log(`Step execution begins: ${stepText}`);
});

/**
 * Logic after each step - Capturing screenshots and logs.
 */
AfterStep((scenario) => {
  const stepText = scenario.pickleStep.text.replace(/\s+/g, '_').substring(0, 30);
  const screenshotName = `${stepText}_${Date.now()}`;

  cy.screenshot(screenshotName, { capture: 'viewport' });
  cy.log(`Completed step: ${scenario.pickleStep.text}`);
});

/**
 * Global teardown after each scenario.
 */
After((scenario) => {
  cy.log(`Scenario finished successfully ${scenario.pickle.name}.`);
});

Given('I am on the Parabank home page', () => {
  cy.log('Navigating to Parabank index page');
  cy.visit('https://parabank.parasoft.com/parabank/index.htm');
});

/**
 * Navigates to a specific page using the custom parameter type.
 */
When('I navigate to the {pageName}', (pageName: string) => {
  cy.log(`Clicking on link for: ${pageName}`);
  cy.contains('a', pageName).click();
});

/**
 * Fills registration details from a Gherkin DataTable.
 */
When('I fill in my personal details:', (dataTable: DataTable) => {
  const data = dataTable.hashes()[0];
  cy.log(`Filling registration details for: ${data['First Name']} ${data['Last Name']}`);

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

When('I choose a username {string} and password {string}', (username: string, password: string) => {
  cy.log(`Choosing credentials: ${username}`);
  cy.get('input[id="customer.username"]').type(username);
  cy.get('input[id="customer.password"]').type(password);
  cy.get('input[id="repeatedPassword"]').type(password);
});

When('I click on the {string} button', (buttonValue: string) => {
  cy.log(`Clicking button with value: ${buttonValue}`);
  cy.get(`input[type="submit"][value="${buttonValue}"]`).click();
});

Then('I should see a welcome message {string}', (message: string) => {
  cy.log(`Verifying welcome message: ${message}`);
  cy.get('h1.title').should('contain', message);
});

Then('I should be logged in', () => {
  cy.log('Verifying Logout link visibility');
  cy.contains('a', 'Log Out').should('be.visible');
});

When('I enter my username {string} and password {string}', (username: string, password: string) => {
  cy.log(`Entering login credentials for: ${username}`);
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
});

Then('I should see the {string} page', (title: string) => {
  cy.log(`Verifying page title: ${title}`);
  cy.get('h1.title').should('contain', title);
});

Then('I should not see the {string} error message', (errorText: string) => {
  cy.log(`Confirming absence of error: ${errorText}`);
  cy.get('.error').should('not.contain', errorText);
});

Then('I should see an error message {string}', (errorText: string) => {
  cy.log(`Verifying error message: ${errorText}`);
  cy.get('.error').should('contain', errorText);
});

Then('I should still be on the home page', () => {
  cy.log('Verifying URL is on index page');
  cy.url().should('include', '/index.htm');
});

/**
 * Fills account lookup details from a DataTable.
 */
When('I fill in the lookup form with:', (dataTable: DataTable) => {
  const data = dataTable.hashes()[0];
  cy.log(`Filling lookup details for: ${data['First Name']} ${data['Last Name']}`);

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

Then('I should see my login information', () => {
  cy.log('Verifying success message for lookup');
  cy.get('p').should('contain', 'Your login information was located successfully');
});

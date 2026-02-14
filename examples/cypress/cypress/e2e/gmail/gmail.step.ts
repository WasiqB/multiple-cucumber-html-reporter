/// <reference types="cypress" />

import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I open the gmail', () => {
  cy.visit('https://mail.google.com');
});

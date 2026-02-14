/// <reference types="cypress" />

import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I open the google', () => {
  cy.visit('https://www.google.co.in');
});

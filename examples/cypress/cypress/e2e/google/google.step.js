/// <reference types="cypress" />

import { Given } from "@badeball/cypress-cucumber-preprocessor";

// Import the necessary modules

Given("I open the google", function () {
  cy.visit("https://www.google.co.in");
});

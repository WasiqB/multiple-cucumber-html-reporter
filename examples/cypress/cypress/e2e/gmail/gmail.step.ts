import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I open the gmail", function () {
  cy.visit("https://mail.google.com");
});

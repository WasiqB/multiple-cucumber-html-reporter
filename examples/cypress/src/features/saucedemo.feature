@saucedemo @regression
Feature: Sauce Demo Web Application Testing
  As a customer of Sauce Demo
  I want to be able to login, add products to cart, and checkout successfully
  So that I can purchase items online

  Background:
    Given I am on the Sauce Demo login page

  @checkout @e2e
  Scenario: End-to-end checkout flow and logout
    When I enter username "standard_user" and password "secret_sauce"
    And I click the login button
    Then I should see the login result as "success" with message "Products"
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge count should be "1"
    When I click on the shopping cart
    Then I should see "Sauce Labs Backpack" in the cart
    When I click the checkout button
    And I fill checkout information with:
      | First Name | Last Name | Zip Code |
      | John       | Doe       |    12345 |
    And I click the continue button
    Then I should see the checkout overview for "Sauce Labs Backpack"
    When I click the finish button
    Then I should see the success page with message "Thank you for your order!"
    When I open the side menu
    And I click the logout button
    Then I should see the login page

  @Status
  Scenario: Verify passed status
    When I enter username "standard_user" and password "secret_sauce"
    And I click the login button
    Then I should see the login result as "success" with message "Products"

  @Status
  Scenario: Verify failed and skipped statuses
    When I enter username "standard_user" and password "secret_sauce"
    And I click the login button
    And This will fail
    Then This will get skipped

  @Status
  Scenario: Verify undefined status
    And Here is a missing step

  @Status
  Scenario: Verify pending status
    Then This will be pending

  @Status
  Scenario: Verify ambiguous status
    Then Here is a "ambiguous" step

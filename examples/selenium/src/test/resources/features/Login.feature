Feature: Login Page tests

  In order to perform Online Shopping
  As a valid LambdaTest e-commerce user
  I want to login successfully

  Scenario: Login to the website with a valid user
    Given I am on the login page
    When I enter a valid username and password
    And click on the login button
    Then I should be taken to My Account page
    And the logout button should be displayed

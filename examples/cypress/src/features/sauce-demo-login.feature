@saucedemo @regression
Feature: Sauce Demo Web Application Login Testing
  As a customer of Sauce Demo
  I want to verify login functionality

  Background:
    Given I am on the Sauce Demo login page

  @login @data-driven
  Scenario Outline: Data-driven login test for "<username>"
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should see the login result as "<result>" with message "<message>"

    Examples:
      | username        | password     | result  | message                                                                   |
      | standard_user   | secret_sauce | success | Products                                                                  |
      | locked_out_user | secret_sauce | failure | Epic sadface: Sorry, this user has been locked out.                       |
      | standard_user   | wrong_pass   | failure | Epic sadface: Username and password do not match any user in this service |
      | invalid_user    | secret_sauce | failure | Epic sadface: Username and password do not match any user in this service |

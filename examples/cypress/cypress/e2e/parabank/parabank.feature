@parabank @regression
Feature: Parabank Web Application Testing
  As a customer of Parabank
  I want to be able to register, login, and manage my accounts
  So that I can perform banking operations online

  Description:
  This feature file covers the end-to-end testing of the Parabank web application,
  including user registration, authentication (login/logout), and basic account 
  recovery via the "Forgot login info?" utility.

  Background:
    Given I am on the Parabank home page

  Rule: User registration should be straightforward
    Description: All new users must be able to create an account by providing 
    valid personal and credential information.

    @smoke @registration
    Scenario Outline: Successful user registration
      When I navigate to the "Register" page
      And I fill in my personal details:
        | First Name | Last Name | Address   | City   | State | Zip Code | Phone    | SSN       |
        | <firstName>| <lastName>| <address> | <city> | <state>| <zipCode>| <phone>  | <ssn>     |
      And I choose a username "<username>" and password "<password>"
      And I click on the "Register" button
      Then I should see a welcome message "Welcome <username>"
      And I should be logged in

      Examples:
        | firstName | lastName | address      | city      | state | zipCode | phone      | ssn       | username    | password |
        | John      | Doe      | 123 Main St | New York  | NY    | 10001   | 1234567890 | 999-00-11 | user123     | pass123  |
        | Jane      | Smith    | 456 Elm St  | Chicago   | IL    | 60601   | 0987654321 | 888-11-22 | jane_smith  | secure789|

  Rule: User login and authentication
    Description: Authenticated users should have access to their account overview.
    Invalid credentials should be gracefully handled with error messages.

    @login
    Scenario: Successful login with valid credentials
      When I enter my username "john_doe" and password "password123"
      And I click on the "Log In" button
      Then I should see the "Accounts Overview" page
      But I should not see the "Login" error message

    @login @negative
    Scenario: Unsuccessful login with invalid credentials
      When I enter my username "invalid_user" and password "invalid_pass"
      And I click on the "Log In" button
      Then I should see an error message "The username and password could not be verified."
      * I should still be on the home page

  Rule: Account lookup should help users who forgot their credentials
    Description: Users who have forgotten their username or password can 
    retrieve it by providing their personal information registered with Parabank.

    @lookup
    Example: Look up login info using personal details
      When I navigate to the "Forgot login info?" page
      And I fill in the lookup form with:
        | First Name | Last Name | Address   | City   | State | Zip Code | SSN       |
        | John      | Doe      | 123 Main St | New York| NY    | 10001   | 999-00-11 |
      And I click on the "Find My Login Info" button
      Then I should see my login information

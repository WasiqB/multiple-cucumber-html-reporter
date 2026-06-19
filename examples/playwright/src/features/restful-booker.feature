@api @restful-booker @regression
Feature: Restful Booker API CRUD Operations
  As an API tester
  I want to verify that the Restful Booker API performs all standard CRUD operations
  So that I can ensure the API is fully functional

  Scenario: Create, Retrieve, Update, and Delete a booking
    Given I initialize the Restful Booker API client
    When I authenticate with username "admin" and password "password123"
    Then I should receive a valid auth token
    When I create a booking with the following details:
      | firstname | lastname | totalprice | depositpaid | checkin    | checkout   | additionalneeds |
      | John      | Doe      |        150 | true        | 2026-07-01 | 2026-07-05 | Breakfast       |
    Then the booking should be created successfully
    And the created booking details should match the payload
    And I should store the new booking ID
    When I retrieve the list of all bookings
    Then the list should contain the newly created booking ID
    When I retrieve the booking details by the stored ID
    Then the retrieved booking details should match the creation payload
    When I update the booking details to:
      | firstname | lastname | totalprice | depositpaid | checkin    | checkout   | additionalneeds |
      | Jane      | Doe      |        200 | false       | 2026-07-02 | 2026-07-06 | Dinner          |
    Then the booking should be updated successfully
    And the updated booking details should match the new payload
    When I retrieve the booking details by the stored ID again
    Then the retrieved booking details should match the updated payload
    When I delete the booking by the stored ID
    Then the booking should be deleted successfully
    When I attempt to retrieve the booking details by the stored ID
    Then the booking should not be found

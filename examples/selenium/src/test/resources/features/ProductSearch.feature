Feature: Product Search
  As a website user
  I want to search for products
  So that I can quickly find the items I'm looking for

  Scenario: Successful product search from the home page
    Given I am on the LambdaTest E-Commerce Playground home page
    When I type "iPhone" into the search field
    And I click the search button
    Then the search results page should show products related to "iPhone"

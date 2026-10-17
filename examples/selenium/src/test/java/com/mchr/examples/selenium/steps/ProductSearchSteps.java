package com.mchr.examples.selenium.steps;

import static java.lang.System.getenv;
import static org.openqa.selenium.By.cssSelector;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.time.Duration;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;

public class ProductSearchSteps {
    private static final String GRID_URL      = "@hub.lambdatest.com/wd/hub";
    private static final String LT_ACCESS_KEY = getenv ("LT_ACCESS_KEY");
    private static final String LT_USERNAME   = getenv ("LT_USERNAME");

    private       RemoteWebDriver driver;
    private final By              searchBox = cssSelector ("#main-header input[name='search']");

    @Given ("I am on the LambdaTest E-Commerce Playground home page")
    public void i_am_on_the_lambda_test_e_commerce_playground_home_page () {
        this.driver.get ("https://ecommerce-playground.lambdatest.io/");
        final WebElement searchField = this.driver.findElement (this.searchBox);
        assertTrue (searchField.isDisplayed ());
    }

    @And ("I click the search button")
    public void i_click_the_search_button () {
        final WebElement searchButton = this.driver.findElement (cssSelector ("#search button[type='submit']"));
        searchButton.click ();
    }

    @When ("I type {string} into the search field")
    public void i_type_into_the_search_field (final String productName) {
        final WebElement searchField = this.driver.findElement (this.searchBox);
        searchField.sendKeys (productName);
    }

    @Before
    public void setup () {
        final var options = new ChromeOptions ();
        if (getenv ("CI").equals ("true")) {
            options.addArguments ("--headless");
        }
        this.driver = new ChromeDriver (options);
        this.driver.manage ()
            .window ()
            .maximize ();
        this.driver.manage ()
            .timeouts ()
            .implicitlyWait (Duration.ofSeconds (30));
    }

    @After
    public void tearDown () {
        this.driver.quit ();
    }

    @Then ("the search results page should show products related to {string}")
    public void the_search_results_page_should_show_products_related_to (final String productName) {
        final String headerText = this.driver.findElement (cssSelector ("#product-search h1"))
            .getText ();
        assertEquals (headerText, "Search - " + productName);
    }
}

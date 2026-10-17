package com.mchr.examples.selenium.steps;

import static java.lang.System.getenv;
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
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class LoginSteps {
    private WebDriver driver;

    @And ("click on the login button")
    public void clickOnTheLoginButton () {
        final WebElement loginButton = this.driver.findElement (By.cssSelector ("input[value=Login]"));
        loginButton.click ();
    }

    @Given ("I am on the login page")
    public void iAmOnTheLoginPage () {
        this.driver.get ("https://ecommerce-playground.lambdatest.io/index.php?route=account/login");
        final String headerText = this.driver.findElement (By.cssSelector ("#content div:nth-child(2) h2"))
            .getText ();
        assertEquals (headerText, "Returning Customer");
    }

    @When ("I enter a valid username and password")
    public void iEnterAValidUsernameAndPassword () {
        final WebElement emailIdField = this.driver.findElement (By.id ("input-email"));
        emailIdField.sendKeys ("david.thomson@gmail.com");
        final WebElement passwordField = this.driver.findElement (By.id ("input-password"));
        passwordField.sendKeys ("Secret@123");
    }

    @Then ("I should be taken to My Account page")
    public void iShouldBeTakenToMyAccountPage () {
        final String myAccountHeaderText = this.driver.findElement (By.cssSelector ("#content h2"))
            .getText ();
        assertEquals (myAccountHeaderText, "My Account");
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

    @And ("the logout button should be displayed")
    public void theLogoutButtonShouldBeDisplayed () {
        final WebElement logoutLink = this.driver.findElement (By.linkText ("Logout"));
        assertTrue (logoutLink.isDisplayed ());
    }
}

package com.mchr.examples.selenium;

import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines ("cucumber")
@SelectPackages ("features")
public class TestRunner {
    // This class remains completely empty.
}
package com.mchr.examples.selenium;

import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines ("cucumber")
@SelectClasspathResource ("features")
public class TestRunner {
    // This class remains completely empty.
}
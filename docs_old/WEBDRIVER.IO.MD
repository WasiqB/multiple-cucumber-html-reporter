# webdriver.io

> **NOTE:**
> If you are using WebdriverIO V4 follow the instructions below, if you are using WebdriverIO V5, please check [wdio-cucumberjs-json-reporter](https://github.com/webdriverio-community/wdio-cucumberjs-json-reporter).

Follow the installation instructions as mentioned in [Install](../README.MD#install)

## Using wdio-cucumber-framework version 2.2.0 or higher?

If you are using the latest version of `wdio-cucumber-framework` version `2.2.0` or higher, you can now use a new reporter called [wdio-multiple-cucumber-html-reporter](https://github.com/WasiqB/wdio-multiple-cucumber-html-reporter).
It works nicely with this reporter.

## Using wdio-cucumber-framework version lower than 2.2.0?

> **NOTE: THIS INSTRUCTION ONLY WORKS WITH `CucumberJS` V2 AND THUS `wdio-cucumber-framework` V1.1.1. I'M WORKING ON A SOLUTION FOR THE LATEST VERSION OF `CucumberJS` V4 AND THUS `wdio-cucumber-framework` > V2.0.0** > **THIS REPORT WORKS BASED ON EXTRA PROVIDED BROWSER INFO IN THE REPORT. PLEASE FOLLOWING THE INSTRUCTIONS BELOW / IN THE README.MD TO ADD THAT INFO. IF YOU DON'T YOU MAY GET ERRORS GENERATING THE REPORT**

## Step 1: Add extra dependency

Add an extra dependency to your project so you can save the extra JSON-files.

`npm install fs-extra --save-dev`

This dependency will be used in the next step.

## Steps 2: Create a report hook

Create a file called `report.hook.js` and save it in your project. I always have a specific folder in which I save my configs and hooks like `./e2e/config/hooks`.

This hook will do the following:

- is will take the complete report (of all features that have been run) and cut it into small reports per feature.
- each report will get the instance data that is needed to show the name/version of the browser/platform in the report, see the comments in the hook, see also [MetaData](../README.MD#metadata-1)

Add the following code to it:

```js
import Cucumber, { defineSupportCode } from "cucumber";
import { ensureDirSync, writeJsonSync } from "fs-extra";
import { join } from "path";

const jsonFormatter = new Cucumber.JsonFormatter();
const projectRoot = process.cwd();

/**
 * This hook is needed to generate a json-file for the reporting
 */
defineSupportCode(({ registerListener }) => {
  registerListener(jsonFormatter);

  return generateAndSaveJsonFile();

  /**
   * Generate and save the report json files
   */
  function generateAndSaveJsonFile() {
    jsonFormatter.log = (report) => {
      adjustAndSaveJsonFile(device.desiredCapabilities, report);
    };
  }

  /**
   * Adjust and save the json files
   */
  function adjustAndSaveJsonFile(capabilities, report) {
    const jsonReport = JSON.parse(report);
    if (jsonReport.length > 0) {
      const featureName =
        jsonReport[0].name
          .replace(/\s+/g, "_")
          .replace(/\W/g, "")
          .toLowerCase() || "noName";
      const snapshotPath = join(projectRoot, ".tmp/json-output");
      const filePath = join(
        snapshotPath,
        `${featureName}.${
          capabilities.browserName
        }.${new Date().getTime()}.json`
      ); // eslint-disable-line

      // The report is enriched with data of the running instance, this is needed to show the name/version of the browser/platform in the report
      jsonReport[0].metadata = {
        browser: {
          name: capabilities.browserName,
          version: "60", // Add your version or dynamically add your version here
        },
        device: "local development machine",
        platform: {
          name: "osx", // Add your platform name here
          version: "10.12.6", // Add your platform version here
        },
      };

      ensureDirSync(snapshotPath);

      writeJsonSync(filePath, jsonReport, { spaces: 2 });
    }
  }
});
```

## Step 3: Create an after scenario hook

If you want to attach a screenshot after failure to the report hook create a file called `after.scenario.js` and save it to your project.

```js
import { After, Status } from "cucumber";

After(function (scenarioResult) {
  if (scenarioResult.status === Status.FAILED) {
    // Attach the original state
    const screenshot = browser.saveScreenshot();
    world.attach(screenshot, "image/png");
  }

  return Promise.resolve(scenarioResult.status);
});
```

### Step 4: Change the wdio.config

Add the following lines of code to your `wdio.conf.js` file (or however you call it). See [Options](../README.MD#options) for more options

```js
const report = require("multiple-cucumber-html-reporter"); // this will add the reporter to your config

// Add a `onComplete`-hook with the following data.
onComplete: () => {
  report.generate({
    jsonDir: ".tmp/json-output/",
    reportPath: ".tmp/report/",
  });
};
```

The `jsonDir` will tell the module where to find the the generated JSON-report files, the `reportPath` will be the path to where the reports are saved.

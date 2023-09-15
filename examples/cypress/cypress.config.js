const { defineConfig } = require("cypress");
const fs = require("fs");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const browserify = require("@badeball/cypress-cucumber-preprocessor/browserify");

function createReportJsonMeta(results) {
  fs.writeFileSync(
    "./reports/generated/results.json",
    JSON.stringify(
      {
        browserName: results.browserName,
        browserVersion: results.browserVersion,
        osName: results.osName,
        osVersion: results.osVersion,
        nodeVersion: results.config.resolvedNodeVersion,
        cypressVersion: results.cypressVersion,
        startedTestsAt: results.startedTestsAt,
        endedTestsAt: results.endedTestsAt,
      },
      null,
      "\t"
    )
  );
}
async function setupNodeEvents(on, config) {
  await preprocessor.addCucumberPreprocessorPlugin(on, config);

  on("file:preprocessor", browserify.default(config));
  on("after:run", async (results) => {
    if (results) {
      createReportJsonMeta(results);
      let sourcePath = "./reports/cucumber-json";
      let oldExtension = "cucumber.json";
      let newExtension =
        results.browserName + "." + new Date().getTime() + ".json";
      fs.readdir(sourcePath, (err, files) => {
        if (err) {
          cy.log("Issue in the file reading");
          return;
        }

        files.forEach((file) => {
          const oldFilePath = `${sourcePath}/${file}`;

          if (file.endsWith(`.${oldExtension}`)) {
            const newFilePath = `${sourcePath}/${file.replace(
              `.${oldExtension}`,
              `.${newExtension}`
            )}`;
            fs.rename(oldFilePath, newFilePath, (err) => {
              if (err) {
                cy.log("Issue in the file renaming");
              }
            });
          }
        });
      });
    }
  });

  return config;
}

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.feature",
    setupNodeEvents,
    defaultCommandTimeout: 60000,
    pageLoadTimeout: 60000,
    video: false,
    reporter: "json",
  },
});

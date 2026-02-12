import { defineConfig } from "cypress";
import { writeFileSync } from "fs";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import {
  addCucumberPreprocessorPlugin,
  afterRunHandler,
} from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    })
  );
  on(
    "after:run",
    async (
      results:
        | CypressCommandLine.CypressRunResult
        | CypressCommandLine.CypressFailedRunResult
    ): Promise<void> => {
      if (results) {
        await afterRunHandler(config, results);
        writeFileSync(".run/results.json", JSON.stringify(results));
      }
    }
  );

  return config;
}

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.feature",
    setupNodeEvents,
    defaultCommandTimeout: 60000,
    pageLoadTimeout: 60000,
    video: false,
    experimentalInteractiveRunEvents: true,
    downloadsFolder: "./cypress/.run/downloads",
    fixturesFolder: "./cypress/.run/fixtures",
    screenshotsFolder: "./cypress/.run/screenshots",
    videosFolder: "./cypress/.run/videos",
  },
});

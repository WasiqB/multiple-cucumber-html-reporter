import { writeFileSync } from 'node:fs';
import { addCucumberPreprocessorPlugin, afterRunHandler } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { defineConfig } from 'cypress';

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    'file:preprocessor',
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    }),
  );
  on(
    'after:run',
    async (results: CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult): Promise<void> => {
      if (results) {
        await afterRunHandler(config, results);
        writeFileSync('.run/results.json', JSON.stringify(results));
      }
    },
  );

  return config;
}

export default defineConfig({
  e2e: {
    specPattern: 'src/features/*.feature',
    setupNodeEvents,
    defaultCommandTimeout: 60000,
    pageLoadTimeout: 60000,
    video: false,
    experimentalInteractiveRunEvents: true,
    supportFile: 'src/support/e2e.ts',
    downloadsFolder: './src/.run/downloads',
    fixturesFolder: './src/.run/fixtures',
    screenshotsFolder: './src/.run/screenshots',
    videosFolder: './src/.run/videos',
  },
});

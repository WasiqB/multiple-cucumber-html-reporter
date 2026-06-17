# Cypress Cucumber Example

This is a sample project for Cypress and Cucumber with Multiple HTML Cucumber Reporter.

## Steps to generate Multiple Cucumber HTML reporter

### Generate Cucumber JSON reports

The multiple cucumber HTML reporter requires the Cucumber JSON report files in order to generate the beautiful HTML reports.

We have used `@badeball/cypress-cucumber-preprocessor` and `@bahmutov/cypress-esbuild-preprocessor` dependencies to generate the Cucumber JSON report files.

#### Cypress Configuration

```ts
// cypress.config.ts
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
    downloadsFolder: './src/.run/downloads',
    fixturesFolder: './src/.run/fixtures',
    screenshotsFolder: './src/.run/screenshots',
    videosFolder: './src/.run/videos',
  },
});
```

#### Cucumber pre-processor configuration

```json
// .cypress-cucumber-preprocessorrc.json
{
  "json": {
    "enabled": true,
    "output": ".run/reports/json/cucumber-report.json"
  },
  "messages": {
    "enabled": true,
    "output": ".run/reports/messages/cucumber-report.json"
  },
  "stepDefinitions": [
    "src/steps/saucedemo.steps.ts"
  ]
}
```

#### Script to generate the report

See [cucumber-html-report.ts](./cucumber-html-report.ts) file for the content used to generate the HTML report.

### Configure the scripts in `package.json`

```json
// package.json
{
  "scripts": {
    "clean": "rm -rf dist .run",
    "build": "pnpm clean && tsc",
    "test": "pnpm build && cypress run --browser chrome --headed",
    "report": "node dist/cucumber-html-report.js"
  },
}
```

- `pnpm clean` - Remove the `dist` and `.run` folders
- `pnpm build` - Compiles the TypeScript code for `cucumber-html-report.ts`
- `pnpm test` - Run the tests in the browser
- `pnpm report` - Generate the HTML report

### Install the dependencies

Install the dependencies by running the following command:

```shell
pnpm install
```

### Run the Tests

```shell
pnpm test
```

### Generate the HTML reporter

```shell
pnpm report
```

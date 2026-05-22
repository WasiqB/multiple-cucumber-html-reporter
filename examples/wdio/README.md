# WebDriverIO Cucumber Example

This is a sample project for WebDriverIO and Cucumber with Multiple HTML Cucumber Reporter.

## Steps to generate Multiple Cucumber HTML reporter

### Generate Cucumber JSON reports

The multiple cucumber HTML reporter requires the Cucumber JSON report files in order to generate the beautiful HTML reports.

We have used `wdio-cucumberjs-json-reporter` dependency to generate the Cucumber JSON report files.

#### WebDriverIO Configuration

Following is the key configuration changes required for generating Cucumber JSON reports and the beautiful HTML report:

```ts
// wdio.conf.ts
import { rm } from 'node:fs/promises';
import { generate } from 'multiple-cucumber-html-reporter';
import cucumberJson from 'wdio-cucumberjs-json-reporter';

export const config: WebdriverIO.Config = {
  . . .
  specs: ['./src/features/*.feature'],
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],
  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'cucumberjs-json',
      {
        jsonFolder: 'reports/json',
      },
    ],
  ],
  cucumberOpts: {
    require: ['./src/step-definitions/*.steps.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },
  onPrepare: async () => await rm('reports', { recursive: true }),
  afterScenario: async (_world, result, _context) => {
    if (!result.passed) {
      cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
    }
  },
  onComplete: async (_exitCode, _config, _capabilities, _results) => {
    await generate({
      jsonDir: 'reports/json/',
      reportPath: 'reports/report/',
      useCDN: false,
      openReportInBrowser: true,
      saveCollectedJSON: true,
      displayReportTime: true,
      durationInMS: false,
      displayDuration: true,
      pageTitle: 'My WDIO Typescript Sample',
      reportName: 'Cucumber JS Report',
    });
  },
  . . .
};
```

### Configure the scripts in `package.json`

```json
// package.json
{
  "scripts": {
    "test": "wdio run ./wdio.conf.ts"
  },
}
```

See [wdio.conf.ts](./wdio.conf.ts) file for complete configuration.

- `pnpm test` - Runs the tests in the browser and generates / opens the HTML report in the browser (if configured)

### Install the dependencies

Install the dependencies by running the following command:

```shell
pnpm install
```

### Run and generate HTML reporter

```shell
pnpm test
```

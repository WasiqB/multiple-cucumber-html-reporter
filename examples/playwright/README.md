# Playwright Cucumber Example

This is a sample project for Playwright and Cucumber with Multiple HTML Cucumber Reporter.

## Steps to generate Multiple Cucumber HTML reporter

### Generate Cucumber JSON reports

The multiple cucumber HTML reporter requires the Cucumber JSON report files in order to generate the beautiful HTML reports.

We have used `@cucumber/cucumber` dependency to generate the Cucumber JSON report files.

#### Cucumber configuration

```json
// cucumber.json
{
  "default": {
    "import": ["src/steps/*.steps.ts"],
    "paths": ["src/features/*.feature"],
    "format": ["progress", "json:reports/cucumber-report.json"]
  }
}
```

#### Script to generate the report

See [generate-report.ts](./src/utils/generate-report.ts) file for the content used to generate the HTML report.

### Configure the scripts in `package.json`

```json
// package.json
{
  "scripts": {
    "test": "tsx src/utils/prepare-run.ts && node --import tsx ./node_modules/@cucumber/cucumber/bin/cucumber-js && tsx src/utils/generate-report.ts"
  },
}
```

- `pnpm test` - Run the tests in the browser and open the report in default browser if configured.

### Install the dependencies

Install the dependencies by running the following command:

```shell
pnpm install
```

### Run the Tests and generate report

```shell
pnpm test
```

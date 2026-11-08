# WebDriverIO Cucumber Example

This is a sample project for WebDriverIO and Cucumber using the Multiple Cucumber HTML Reporter (`mchr`).

> [!TIP]
> The recommended way to generate reports is using the `mchr` CLI — **not** the `generate()` API.
> The `mchr` CLI reads from a `.multiple-cucumber-html-reporter.yml` config file and keeps your WDIO config clean.

## Project Structure

```
examples/wdio/
├── src/
│   ├── features/           # Cucumber .feature files
│   ├── steps/              # Step definitions
│   └── libs/
│       └── metadata-parser.ts  # Parses browser metadata & updates report files
├── wdio-shared.conf.ts     # Shared WDIO config (base)
├── wdio-cc-formatter.conf.ts   # Cucumber in-built formatter (JSON + Messages NDJSON)
├── wdio-cc-reporter.conf.ts    # @wdio/cucumberjs-json-reporter (JSON only)
├── .multiple-cucumber-html-reporter.yml  # mchr CLI config
└── package.json
```

## Approaches

This example supports two approaches for generating Cucumber output files, both of which feed into `mchr`:

| Approach | Config file | Output format |
|---|---|---|
| **Cucumber in-built formatter** | `wdio-cc-formatter.conf.ts` | JSON and/or Cucumber Messages NDJSON |
| **`@wdio/cucumberjs-json-reporter`** | `wdio-cc-reporter.conf.ts` | JSON only |

---

## Setup

### 1. Install Dependencies

```shell
pnpm install
```

### 2. Reporter Configuration

The `mchr` CLI is configured via `.multiple-cucumber-html-reporter.yml` in the project root:

```yaml
# .multiple-cucumber-html-reporter.yml
jsonDir: ./reports/${MESSAGES:'json'}
reportPath: ./reports/html
emailReport: true
openReportInBrowser: true
displayDuration: true
humanReadableDuration: true
displayReportTime: true
durationInMS: true
durationAggregation: sum
pageTitle: 'My WDIO Typescript Sample'
reportName: 'WDIO Cucumber JS Report'
metadataFilePath: ./reports/metadata.json
customData:
  projectName: 'WebDriverIO sample project'
  release: '1.2.0'
  testCycle: ${GITHUB_RUN_ID:'Cycle 1'}
  buildNumber: ${GITHUB_RUN_NUMBER:'Build 1'}
  environment: 'production'
  ciPipeline: 'GitHub Actions'
```

> [!NOTE]
> `${MESSAGES:'json'}` is an environment variable interpolation with a default fallback. When `MESSAGES=messages` is set,
> `mchr` reads from `./reports/messages/` (NDJSON); otherwise it reads from `./reports/json/` (JSON).

---

## Approach 1: Cucumber In-built Formatter

The `wdio-cc-formatter.conf.ts` config uses Cucumber's native `format` option to output both JSON and
Cucumber Messages NDJSON files simultaneously, one file per WDIO worker.

### WDIO Config Highlights

```typescript
// wdio-cc-formatter.conf.ts
export const config: WebdriverIO.Config = {
  ...sharedConfig,
  cucumberOpts: {
    ...sharedConfig.cucumberOpts,
    format: [
      'progress',
      `json:reports/json/cucumber-report-${process.env.WDIO_WORKER_ID || '0-0'}.json`,
      `message:reports/messages/cucumber-message-${process.env.WDIO_WORKER_ID || '0-0'}.ndjson`,
    ],
  },
};
```

> [!NOTE]
> `process.env.WDIO_WORKER_ID` ensures each parallel worker writes to a unique file (e.g. `0-0`, `0-1`).

### Run Tests and Generate Report

**Using Legacy JSON:**

```shell
pnpm test:formatter
pnpm mchr
```

**Using Cucumber Messages (NDJSON) — includes scenario start/end timestamps:**

```shell
MESSAGES=messages pnpm test:formatter
MESSAGES=messages pnpm mchr -m
```

---

## Approach 2: `@wdio/cucumberjs-json-reporter`

The `wdio-cc-reporter.conf.ts` config uses the WDIO community reporter to generate JSON output.

### WDIO Config Highlights

```typescript
// wdio-cc-reporter.conf.ts
export const config: WebdriverIO.Config = {
  ...sharedConfig,
  reporters: [
    'spec',
    [
      'cucumberjs-json',
      {
        jsonFolder: 'reports/json',
      },
    ],
  ],
  onComplete: async (_exitCode, _config, capabilities, _results) => {
    saveMetadata(capabilities as (WebdriverIO.Capabilities & { 'cjson:metadata': Metadata })[]);
  },
};
```

### Run Tests and Generate Report

```shell
pnpm test:reporter
pnpm mchr
```

---

## Metadata Parsing

Both approaches use `src/libs/metadata-parser.ts` in the `onComplete` WDIO hook to:

- Rename feature names with the browser label (e.g. `Login Feature [CHROME]`)
- Update feature URIs to avoid collisions when running cross-browser
- Write a `reports/metadata.json` file that `mchr` picks up via `metadataFilePath`

```typescript
// wdio-shared.conf.ts (onComplete hook)
onComplete: async (_exitCode, _config, capabilities, _results) => {
  saveMetadata(capabilities as (WebdriverIO.Capabilities & { 'cjson:metadata': Metadata })[]);
},
```

---

## `mchr` CLI Reference

The `mchr` CLI reads all configuration from `.multiple-cucumber-html-reporter.yml`. No code changes to your WDIO config are needed to generate the report.

| Command | Description |
|---|---|
| `mchr` | Generate report from JSON files (`./reports/json/`) |
| `mchr -m` | Generate report from Cucumber Messages NDJSON files (`./reports/messages/`) |

> [!IMPORTANT]
> The `generate()` API from `multiple-cucumber-html-reporter` works but is **not recommended** for new setups.
> Use the `mchr` CLI instead — it keeps report generation separate from your WDIO config and is easier to maintain.

---

## CI Workflow

The [GitHub Actions workflow](../../.github/workflows/test-wdio.yml) runs three jobs:

- **`test-formatter`** — runs `wdio-cc-formatter.conf.ts` with both `json` and `messages` matrix variants, then calls `pnpm mchr` or `pnpm mchr -m`
- **`test-reporter`** — runs `wdio-cc-reporter.conf.ts` and then calls `pnpm mchr`
- **`test-browserstack`** — runs against BrowserStack with both formatter variants

```yaml
# Key steps in .github/workflows/test-wdio.yml

- name: Run WDIO
  working-directory: examples/wdio
  run: pnpm test:formatter   # or test:reporter / test:browserstack

- name: Generate Report using ND-JSON files
  if: ${{ matrix.message-format == 'messages' }}
  working-directory: examples/wdio
  run: pnpm mchr -m

- name: Generate Report using JSON files
  if: ${{ matrix.message-format == 'json' }}
  working-directory: examples/wdio
  run: pnpm mchr
```

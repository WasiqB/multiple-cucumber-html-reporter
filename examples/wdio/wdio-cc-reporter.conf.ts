import os from 'node:os';
import { generate, type Metadata } from 'multiple-cucumber-html-reporter';
import { isCI, config as sharedConfig } from './wdio-shared.conf';

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: process.env.WDIO_CHROME_VERSION || '148',
      'wdio:chromedriverOptions': {
        binary: process.env.WDIO_CHROME_DRIVER || undefined,
      },
      'goog:chromeOptions': {
        binary: process.env.WDIO_CHROME_PATH || undefined,
        args: isCI ? ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'] : [],
      },
      'cjson:metadata': {
        browser: {
          name: 'chrome',
          version: process.env.WDIO_CHROME_VERSION || '148',
        },
        device: 'Local Machine',
        executionPlatform: 'local',
        platform: {
          name: os.platform().trim(),
          version: os.release().trim(),
        },
      },
    } as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata },
  ],
  reporters: [
    'spec',
    [
      'cucumberjs-json',
      {
        jsonFolder: 'reports/json',
      },
    ],
  ],
  onComplete: async (
    _exitCode: number,
    _config: WebdriverIO.Config,
    capabilities: WebdriverIO.Capabilities[],
    _results: any,
  ) => {
    const capability = capabilities[0] as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata };
    const reportMetadata: Metadata = capability['cjson:metadata'];

    await generate({
      jsonDir: 'reports/json/',
      reportPath: 'reports/report/',
      useCDN: false,
      openReportInBrowser: true,
      saveCollectedJSON: true,
      displayReportTime: true,
      durationInMS: false,
      displayDuration: true,
      displayChartPercentages: true,
      pageTitle: 'My WDIO Typescript Sample',
      reportName: 'WDIO Cucumber JS Report',
      metadata: reportMetadata,
      customData: {
        projectName: 'WebDriverIO sample project',
        release: '1.2.0',
        testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
        buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
        environment: 'production',
        ciPipeline: 'GitHub Actions',
      },
    });
  },
};

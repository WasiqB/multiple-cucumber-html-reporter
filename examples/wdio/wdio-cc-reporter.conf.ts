import type { Metadata } from 'multiple-cucumber-html-reporter';
import { saveMetadata } from '@/libs/metadata-parser';
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
    saveMetadata(capabilities as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata }[]);
  },
};

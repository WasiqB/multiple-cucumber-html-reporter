import os from 'node:os';
import type { Metadata } from 'multiple-cucumber-html-reporter';
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
};

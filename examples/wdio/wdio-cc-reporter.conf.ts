import os from 'node:os';
import type { Metadata } from '../../reporter/dist/types';
import { config as sharedConfig } from './wdio-shared.conf';

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  capabilities: [
    {
      browserName: 'chrome',
      'cjson:metadata': {
        browser: {
          name: 'chrome',
          version: '148',
        },
        platform: {
          name: os.platform(),
          version: os.release(),
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

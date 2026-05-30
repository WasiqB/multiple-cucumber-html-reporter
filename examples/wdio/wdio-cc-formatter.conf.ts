import { config as sharedConfig } from './wdio-shared.conf';

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  cucumberOpts: {
    ...sharedConfig.cucumberOpts,
    format: ['progress', 'json:reports/json/cucumber-report.json', 'message:reports/message/cucumber-message.ndjson'],
  },
};

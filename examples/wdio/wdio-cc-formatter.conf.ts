import { config as sharedConfig } from './wdio-shared.conf';

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  cucumberOpts: {
    ...sharedConfig.cucumberOpts,
    format: [
      'progress',
      `json:reports/json/cucumber-report-${process.env.WDIO_WORKER_ID}.json`,
      `message:reports/message/cucumber-message-${process.env.WDIO_WORKER_ID}.ndjson`,
    ],
  },
};

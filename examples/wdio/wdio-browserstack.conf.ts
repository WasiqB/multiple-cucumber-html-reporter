import os from 'node:os';
import type { Metadata } from 'multiple-cucumber-html-reporter';
import { config as sharedConfig } from './wdio-shared.conf';

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  user: process.env.BS_USER,
  key: process.env.BS_KEY,
  services: [
    [
      'browserstack',
      {
        testReporting: true,
        testReportingOptions: {
          projectName: 'multiple-cucumber-html-reporter',
          buildName: 'WDIO BrowserStack Mixed',
          sessionName: 'Saucedemo Test - Firefox Windows',
        },
        browserstackLocal: false,
      },
    ],
  ],
  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: '148',
      'bstack:options': {
        os: 'OS X',
        osVersion: 'Tahoe',
      },
      'cjson:metadata': {
        browser: {
          name: 'chrome',
          version: process.env.WDIO_CHROME_VERSION || '148',
        },
        device: 'MacBook Pro',
        executionPlatform: 'browserstack',
        platform: {
          name: os.platform().trim(),
          version: os.release().trim(),
        },
      },
    } as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata },
    {
      browserName: 'firefox',
      browserVersion: 'latest',
      'bstack:options': {
        os: 'Windows',
        osVersion: '11',
      },
      'cjson:metadata': {
        browser: {
          name: 'firefox',
          version: 'latest',
        },
        device: 'Windows Desktop',
        executionPlatform: 'browserstack',
        platform: {
          name: 'windows',
          version: '11',
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
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: async (result, capabilities, _specs) => {
    try {
      const caps = capabilities as WebdriverIO.Capabilities;
      if (caps['bstack:options']) {
        console.log('Updated BrowserStack Session Status');
        if (result === 0) {
          await browser.executeScript(
            'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Test Passed"}',
            [],
          );
        } else {
          await browser.executeScript(
            'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "Test Failed"}}',
            [],
          );
        }
      }
    } catch (error) {
      console.error('Failed to update BrowserStack Session Status', error);
    }
    if (browser.sessionId) {
      await browser.deleteSession();
    }
  },
};

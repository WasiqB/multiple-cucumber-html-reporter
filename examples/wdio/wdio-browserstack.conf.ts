import type { Metadata } from 'multiple-cucumber-html-reporter';
import { saveMetadata } from '@/libs/metadata-parser';
import { config as sharedConfig } from './wdio-cc-formatter.conf';

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
          buildName: 'WDIO BrowserStack',
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
        sessionName: 'Saucedemo Test - Chrome Mac OS',
      },
      'goog:chromeOptions': {
        excludeSwitches: ['enable-automation'],
        prefs: {
          'profile.password_manager_leak_detection': false,
          credentials_enable_service: false,
          password_manager_enabled: false,
        },
        args: ['--disable-popup-blocking', '--disable-notifications', '--disable-infobars', '--no-sandbox'],
      },
      'cjson:metadata': {
        browser: {
          name: 'chrome',
          version: process.env.WDIO_CHROME_VERSION || '148',
        },
        device: 'BrowserStack Mac Machine',
        executionPlatform: 'browserstack',
      },
    } as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata },
    {
      browserName: 'firefox',
      browserVersion: 'latest',
      'bstack:options': {
        os: 'Windows',
        osVersion: '11',
        sessionName: 'Saucedemo Test - Firefox Windows',
      },
      'cjson:metadata': {
        browser: {
          name: 'firefox',
          version: 'latest',
        },
        device: 'BrowserStack Windows Machine',
        executionPlatform: 'browserstack',
      },
    } as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata },
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
  },

  onComplete: async (
    _exitCode: number,
    _config: WebdriverIO.Config,
    capabilities: WebdriverIO.Capabilities[],
    _results: any,
  ) => {
    saveMetadata(capabilities as WebdriverIO.Capabilities & { 'cjson:metadata': Metadata }[]);
  },
};

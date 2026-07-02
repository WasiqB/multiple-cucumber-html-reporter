import { readFileSync } from 'node:fs';
import { generate } from 'multiple-cucumber-html-reporter';

const data = readFileSync('./.run/results.json', {
  encoding: 'utf8',
  flag: 'r',
});
const runInfos = JSON.parse(data);

const mapOs = (os: string) => {
  if (os.startsWith('win')) {
    return 'windows';
  } else if (os.startsWith('darwin')) {
    return 'osx';
  } else if (os.startsWith('linux')) {
    return 'linux';
  } else if (os.startsWith('ubuntu')) {
    return 'ubuntu';
  } else if (os.startsWith('android')) {
    return 'android';
  } else if (os.startsWith('ios')) {
    return 'ios';
  }
  return 'unknown';
};

generate({
  jsonDir: './.run/reports/json/',
  reportPath: './.run/html-report/',
  openReportInBrowser: true,
  useCDN: true,
  metadata: {
    browser: {
      name: runInfos.browserName === 'chromium' ? 'chrome' : runInfos.browserName,
      version: runInfos.browserVersion,
    },
    executionPlatform: 'local',
    platform: {
      name: mapOs(runInfos.osName),
      version: runInfos.osVersion,
    },
  },
  customData: {
    projectName: 'Cypress sample project',
    release: '1.2.0',
    testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
    environment: 'production',
    ciPipeline: 'GitHub Actions',
  },
  pageTitle: 'Cypress Sample',
  reportName: 'Cypress Sample',
  displayDuration: true,
  displayReportTime: true,
});

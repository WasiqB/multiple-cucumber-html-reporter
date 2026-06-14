import { readFileSync } from 'node:fs';
import dayjs from 'dayjs';
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
    platform: {
      name: mapOs(runInfos.osName),
      version: runInfos.osVersion,
    },
  },
  customData: {
    title: 'Cypress Sample',
    data: [
      { label: 'Project', value: 'Sample Cypress Typescript' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Cycle', value: 'Build-1002' },
      { label: 'Cypress Version', value: '15.16.0' },
      { label: 'Test Environment', value: 'QA' },
      {
        label: 'Execution Start Time',
        value: dayjs(runInfos.startedTestsAt).format('YYYY-MM-DD HH:mm:ss.SSS'),
      },
      {
        label: 'Execution End Time',
        value: dayjs(runInfos.endedTestsAt).format('YYYY-MM-DD HH:mm:ss.SSS'),
      },
    ],
  },
  pageTitle: 'Cypress Sample',
  reportName: 'Cypress Sample',
  displayDuration: true,
  displayReportTime: true,
});

import { generate } from 'multiple-cucumber-html-reporter';

generate({
  jsonDir: 'reports/',
  reportPath: 'reports/report/',
  useCDN: false,
  openReportInBrowser: true,
  saveCollectedJSON: true,
  displayReportTime: true,
  durationInMS: false,
  displayDuration: true,
  pageTitle: 'My Playwright Typescript Sample',
  reportName: 'Cucumber JS Report',
  metadata: {
    browser: {
      name: 'chrome',
      version: '148',
    },
    platform: {
      name: 'osx',
      version: '26.5',
    },
  },
  customData: {
    title: 'Run Info',
    data: [
      { label: 'Project', value: 'Sample Playwright' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Test Cycle', value: 'Smoke' },
      { label: 'Test Environment', value: 'Dev' },
      { label: 'Playwright Version', value: '1.40.0' },
      { label: 'Node Version', value: '24.0.0' },
    ],
  },
});

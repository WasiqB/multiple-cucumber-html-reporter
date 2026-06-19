import { generate, type Metadata, updateMetadata } from 'multiple-cucumber-html-reporter';

const metadata: { [key: string]: Metadata } = {
  'saucedemo.feature': {
    browser: {
      name: 'chrome',
      version: '148',
    },
    username: 'Wasiq Bhamla',
    device: 'MacBook Pro 14 inch',
    platform: {
      name: 'osx',
      version: '26.5',
    },
  },
  'restful-booker.feature': {
    browser: {
      name: 'api',
      version: '',
    },
    username: 'Wasiq Bhamla',
    device: 'MacBook Pro 14 inch',
    platform: {
      name: 'osx',
      version: '26.5',
    },
  },
};

updateMetadata('reports/cucumber-report.json', metadata);

generate({
  jsonDir: 'reports/',
  reportPath: 'reports/report/',
  useCDN: false,
  openReportInBrowser: true,
  saveCollectedJSON: false,
  displayReportTime: true,
  durationInMS: true,
  displayDuration: true,
  pageTitle: 'My Playwright Typescript Sample',
  reportName: 'Cucumber JS Report',
  customData: {
    title: 'Playwright Sample',
    data: [
      { label: 'Project', value: 'Sample Playwright Typescript' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Cycle', value: 'Build-1002' },
      { label: 'Playwright Version', value: '1.61.0' },
      { label: 'Test Environment', value: 'Dev' },
    ],
  },
});

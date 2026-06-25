import { generate, type Metadata } from 'multiple-cucumber-html-reporter';

const metadata: { [key: string]: Metadata } = {
  'saucedemo.feature': {
    browser: {
      name: 'chrome',
      version: '148',
    },
  },
  'restful-booker.feature': {
    browser: {
      name: 'api',
      version: '',
    },
  },
};

generate({
  jsonDir: 'reports/',
  reportPath: 'reports/report/',
  useCDN: false,
  openReportInBrowser: true,
  saveCollectedJSON: false,
  displayReportTime: true,
  durationAggregation: 'wallClock',
  displayChartPercentages: true,
  durationInMS: false,
  displayDuration: true,
  pageTitle: 'My Playwright Typescript Sample',
  reportName: 'Cucumber JS Report',
  metadata,
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

const metadata = {
  'saucedemo.feature': {
    browser: {
      name: 'firefox',
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

export default {
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
    projectName: 'Playwright sample project',
    release: '1.2.0',
    testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
    environment: 'production',
    ciPipeline: 'GitHub Actions',
  },
};

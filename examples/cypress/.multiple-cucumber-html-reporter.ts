import type { Options } from 'multiple-cucumber-html-reporter';

const config: Options = {
  jsonDir: './.run/reports/json/',
  reportPath: './.run/html-report/',
  openReportInBrowser: true,
  useCDN: true,
  metadataFilePath: './.run/reports/json/metadata.json',
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
};

export default config;

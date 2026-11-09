import type { Options } from 'multiple-cucumber-html-reporter';

const reportFolder = process.env.MESSAGES ?? 'json';

const config: Options = {
  jsonDir: `./reports/${reportFolder}/`,
  reportPath: './reports/html-report/',
  openReportInBrowser: true,
  useCDN: true,
  emailReport: true,
  humanReadableDuration: true,
  metadataFilePath: `./reports/metadata.json`,
  customData: {
    projectName: 'Cypress sample project',
    release: '1.2.0',
    testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
    environment: 'production',
    ciPipeline: 'GitHub Actions',
  },
  language: 'ar',
  pageTitle: 'Cypress Sample',
  reportName: 'Cypress Sample',
  displayDuration: true,
  displayReportTime: true,
  durationInMS: true,
};

export default config;
